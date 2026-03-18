const express = require('express')
const router = express.Router()
const pool = require('../db')
const { authenticate, requireRole } = require('../middleware/auth')

// Хелпер: добавляет вычисляемое поле is_admin (совместимость с фронтендом)
const mapMessage = (msg) => ({
  ...msg,
  is_admin: msg.sender_role === 'admin',
})

// POST /api/support/chat — создать или вернуть существующий открытый чат пользователя
router.post('/chat', authenticate, async (req, res) => {
  try {
    const userId = req.user.id

    let result = await pool.query(
      `SELECT c.*, u.email AS user_email,
              p.first_name AS user_first_name, p.last_name AS user_last_name
       FROM support_chats c
       JOIN users u ON u.id = c.user_id
       LEFT JOIN profiles p ON p.id = c.user_id
       WHERE c.user_id = $1 AND c.status = 'open'
       ORDER BY c.created_at DESC
       LIMIT 1`,
      [userId]
    )

    if (result.rows.length === 0) {
      result = await pool.query(
        `INSERT INTO support_chats (user_id, status) VALUES ($1, 'open') RETURNING *`,
        [userId]
      )
      const chat = result.rows[0]
      chat.user = { email: req.user.email }
      return res.json({ chat })
    }

    const row = result.rows[0]
    const chat = {
      id: row.id,
      user_id: row.user_id,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user: {
        email: row.user_email,
        first_name: row.user_first_name,
        last_name: row.user_last_name,
      },
    }
    res.json({ chat })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// GET /api/support/chat/:chatId/messages — получить сообщения чата
router.get('/chat/:chatId/messages', authenticate, async (req, res) => {
  try {
    const { chatId } = req.params
    const userId = req.user.id
    const isAdmin = req.user.role === 'admin'

    const chatResult = await pool.query(
      'SELECT * FROM support_chats WHERE id = $1',
      [chatId]
    )
    if (chatResult.rows.length === 0) {
      return res.status(404).json({ error: 'Чат не найден' })
    }
    const chat = chatResult.rows[0]
    if (!isAdmin && chat.user_id !== userId) {
      return res.status(403).json({ error: 'Нет доступа' })
    }

    const result = await pool.query(
      `SELECT * FROM support_messages WHERE chat_id = $1 ORDER BY created_at ASC`,
      [chatId]
    )
    res.json({ messages: result.rows.map(mapMessage) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// POST /api/support/chat/:chatId/messages — отправить сообщение
router.post('/chat/:chatId/messages', authenticate, async (req, res) => {
  try {
    const { chatId } = req.params
    const { message } = req.body
    const userId = req.user.id
    const isAdmin = req.user.role === 'admin'
    const senderRole = isAdmin ? 'admin' : 'user'

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Сообщение не может быть пустым' })
    }

    const chatResult = await pool.query(
      'SELECT * FROM support_chats WHERE id = $1',
      [chatId]
    )
    if (chatResult.rows.length === 0) {
      return res.status(404).json({ error: 'Чат не найден' })
    }
    const chat = chatResult.rows[0]
    if (!isAdmin && chat.user_id !== userId) {
      return res.status(403).json({ error: 'Нет доступа' })
    }
    if (chat.status === 'closed') {
      return res.status(400).json({ error: 'Чат закрыт' })
    }

    const result = await pool.query(
      `INSERT INTO support_messages (chat_id, sender_id, message, sender_role)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [chatId, userId, message.trim(), senderRole]
    )

    await pool.query(
      'UPDATE support_chats SET updated_at = NOW() WHERE id = $1',
      [chatId]
    )

    res.json({ message: mapMessage(result.rows[0]) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// GET /api/support/chats — все чаты (только для администратора)
router.get('/chats', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*,
              u.email AS user_email,
              p.first_name AS user_first_name,
              p.last_name AS user_last_name,
              json_agg(
                json_build_object(
                  'id', m.id, 'message', m.message, 'sender_role', m.sender_role,
                  'is_admin', (m.sender_role = 'admin'), 'created_at', m.created_at,
                  'sender_id', m.sender_id
                ) ORDER BY m.created_at
              ) FILTER (WHERE m.id IS NOT NULL) AS messages
       FROM support_chats c
       JOIN users u ON u.id = c.user_id
       LEFT JOIN profiles p ON p.id = c.user_id
       LEFT JOIN support_messages m ON m.chat_id = c.id
       GROUP BY c.id, u.email, p.first_name, p.last_name
       ORDER BY c.updated_at DESC`
    )

    const chats = result.rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      messages: row.messages || [],
      user: {
        email: row.user_email,
        first_name: row.user_first_name,
        last_name: row.user_last_name,
      },
    }))

    res.json({ chats })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// PATCH /api/support/chat/:chatId — обновить статус чата (закрыть)
router.patch('/chat/:chatId', authenticate, async (req, res) => {
  try {
    const { chatId } = req.params
    const { status } = req.body
    const userId = req.user.id
    const isAdmin = req.user.role === 'admin'

    const chatResult = await pool.query(
      'SELECT * FROM support_chats WHERE id = $1',
      [chatId]
    )
    if (chatResult.rows.length === 0) {
      return res.status(404).json({ error: 'Чат не найден' })
    }
    const chat = chatResult.rows[0]
    if (!isAdmin && chat.user_id !== userId) {
      return res.status(403).json({ error: 'Нет доступа' })
    }

    const result = await pool.query(
      'UPDATE support_chats SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status || 'closed', chatId]
    )
    res.json({ chat: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

module.exports = router
