const express = require('express')
const db = require('../db')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

// GET /api/favorites
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT f.model_id, f.created_at,
        m.title, m.price, m.is_free, m.preview_image_url, m.rating_avg,
        p.display_name AS author_name
       FROM favorites f
       JOIN models m ON m.id = f.model_id
       LEFT JOIN profiles p ON p.id = m.author_id
       WHERE f.user_id = $1 AND m.status = 'published'
       ORDER BY f.created_at DESC`,
      [req.user.id]
    )
    res.json({ favorites: result.rows })
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения избранного' })
  }
})

// POST /api/favorites
router.post('/', authenticate, async (req, res) => {
  const { modelId } = req.body
  if (!modelId) return res.status(400).json({ error: 'modelId обязателен' })
  try {
    await db.query(
      'INSERT INTO favorites (user_id, model_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, modelId]
    )
    res.status(201).json({ message: 'Добавлено в избранное' })
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' })
  }
})

// DELETE /api/favorites/:modelId
router.delete('/:modelId', authenticate, async (req, res) => {
  try {
    await db.query('DELETE FROM favorites WHERE user_id = $1 AND model_id = $2', [req.user.id, req.params.modelId])
    res.json({ message: 'Удалено из избранного' })
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' })
  }
})

module.exports = router
