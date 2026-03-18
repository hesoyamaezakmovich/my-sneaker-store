const express = require('express')
const db = require('../db')
const { authenticate, requireRole } = require('../middleware/auth')

const router = express.Router()
router.use(authenticate, requireRole('admin'))

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [users, models, orders, revenue] = await Promise.all([
      db.query('SELECT COUNT(*) FROM users WHERE is_active = TRUE'),
      db.query("SELECT COUNT(*) FROM models WHERE status = 'published'"),
      db.query("SELECT COUNT(*) FROM orders WHERE status IN ('paid', 'completed')"),
      db.query("SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE status IN ('paid', 'completed')"),
    ])

    const topModels = await db.query(
      `SELECT m.id, m.title, m.download_count, m.price, p.display_name AS author_name
       FROM models m LEFT JOIN profiles p ON p.id = m.author_id
       WHERE m.status = 'published' ORDER BY m.download_count DESC LIMIT 5`
    )

    const recentOrders = await db.query(
      `SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at,
        u.email AS user_email
       FROM orders o JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC LIMIT 10`
    )

    res.json({
      stats: {
        totalUsers: parseInt(users.rows[0].count),
        publishedModels: parseInt(models.rows[0].count),
        paidOrders: parseInt(orders.rows[0].count),
        totalRevenue: parseFloat(revenue.rows[0].total),
      },
      topModels: topModels.rows,
      recentOrders: recentOrders.rows,
    })
  } catch (err) {
    console.error('Admin stats error:', err)
    res.status(500).json({ error: 'Ошибка получения статистики' })
  }
})

// GET /api/admin/moderation
router.get('/moderation', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT m.id, m.title, m.created_at, m.status,
        p.display_name AS author_name, u.email AS author_email
       FROM models m
       JOIN users u ON u.id = m.author_id
       LEFT JOIN profiles p ON p.id = m.author_id
       WHERE m.status = 'pending_review'
       ORDER BY m.created_at ASC`
    )
    res.json({ models: result.rows })
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' })
  }
})

// POST /api/admin/moderation/:modelId/approve
router.post('/moderation/:modelId/approve', async (req, res) => {
  try {
    await db.query("UPDATE models SET status = 'published', updated_at = NOW() WHERE id = $1", [req.params.modelId])
    await db.query(
      "INSERT INTO moderation_queue (model_id, moderator_id, action, comment) VALUES ($1, $2, 'approved', $3)",
      [req.params.modelId, req.user.id, req.body.comment || null]
    )
    res.json({ message: 'Модель опубликована' })
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' })
  }
})

// POST /api/admin/moderation/:modelId/reject
router.post('/moderation/:modelId/reject', async (req, res) => {
  const { reason } = req.body
  try {
    await db.query(
      "UPDATE models SET status = 'rejected', rejection_reason = $1, updated_at = NOW() WHERE id = $2",
      [reason || 'Не указана причина', req.params.modelId]
    )
    await db.query(
      "INSERT INTO moderation_queue (model_id, moderator_id, action, comment) VALUES ($1, $2, 'rejected', $3)",
      [req.params.modelId, req.user.id, reason || null]
    )
    res.json({ message: 'Модель отклонена' })
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' })
  }
})

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { limit = 50, offset = 0, role, search } = req.query
    let where = []
    const params = []

    if (role) { params.push(role); where.push(`u.role = $${params.length}`) }
    if (search) { params.push(`%${search}%`); where.push(`u.email ILIKE $${params.length}`) }

    params.push(parseInt(limit), parseInt(offset))
    const result = await db.query(
      `SELECT u.id, u.email, u.role, u.is_active, u.created_at,
        p.display_name, p.first_name, p.last_name
       FROM users u LEFT JOIN profiles p ON p.id = u.id
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY u.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    )
    res.json({ users: result.rows })
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения пользователей' })
  }
})

// PATCH /api/admin/users/:id
router.patch('/users/:id', async (req, res) => {
  const { isActive, role } = req.body
  try {
    await db.query(
      'UPDATE users SET is_active = COALESCE($1, is_active), role = COALESCE($2, role), updated_at = NOW() WHERE id = $3',
      [isActive, role, req.params.id]
    )
    res.json({ message: 'Пользователь обновлён' })
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' })
  }
})

// GET /api/admin/orders
router.get('/orders', async (req, res) => {
  try {
    const { limit = 50, offset = 0, status } = req.query
    const params = []
    let where = []
    if (status) { params.push(status); where.push(`o.status = $${params.length}`) }
    params.push(parseInt(limit), parseInt(offset))

    const result = await db.query(
      `SELECT o.*, u.email AS user_email, p.display_name AS user_name
       FROM orders o JOIN users u ON u.id = o.user_id LEFT JOIN profiles p ON p.id = o.user_id
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY o.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    )
    res.json({ orders: result.rows })
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения заказов' })
  }
})

// GET /api/admin/settings
router.get('/settings', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM settings ORDER BY key')
    const settings = {}
    result.rows.forEach(row => { settings[row.key] = row.value })
    res.json({ settings })
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' })
  }
})

// PATCH /api/admin/settings
router.patch('/settings', async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      await db.query(
        'INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()',
        [key, String(value)]
      )
    }
    res.json({ message: 'Настройки сохранены' })
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сохранения настроек' })
  }
})

module.exports = router
