const express = require('express')
const db = require('../db')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

// GET /api/cart
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT ci.id, ci.model_id, ci.added_at,
        m.title, m.price, m.is_free, m.preview_image_url,
        p.display_name AS author_name,
        c.name AS category_name
       FROM cart_items ci
       JOIN models m ON m.id = ci.model_id
       LEFT JOIN profiles p ON p.id = m.author_id
       LEFT JOIN categories c ON c.id = m.category_id
       WHERE ci.user_id = $1 AND m.status = 'published'
       ORDER BY ci.added_at DESC`,
      [req.user.id]
    )
    res.json({ items: result.rows })
  } catch (err) {
    console.error('Get cart error:', err)
    res.status(500).json({ error: 'Ошибка получения корзины' })
  }
})

// POST /api/cart
router.post('/', authenticate, async (req, res) => {
  const { modelId } = req.body
  if (!modelId) return res.status(400).json({ error: 'modelId обязателен' })

  try {
    // Проверяем модель
    const modelResult = await db.query("SELECT id FROM models WHERE id = $1 AND status = 'published'", [modelId])
    if (modelResult.rows.length === 0) return res.status(404).json({ error: 'Модель не найдена' })

    // Проверяем, не куплена ли уже
    const purchased = await db.query(
      `SELECT l.id FROM licenses l
       WHERE l.user_id = $1 AND l.model_id = $2 AND l.is_active = TRUE`,
      [req.user.id, modelId]
    )
    if (purchased.rows.length > 0) {
      return res.status(400).json({ error: 'Вы уже приобрели эту модель' })
    }

    const result = await db.query(
      'INSERT INTO cart_items (user_id, model_id) VALUES ($1, $2) ON CONFLICT (user_id, model_id) DO NOTHING RETURNING *',
      [req.user.id, modelId]
    )

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Модель уже в корзине' })
    }

    res.status(201).json({ item: result.rows[0] })
  } catch (err) {
    console.error('Add to cart error:', err)
    res.status(500).json({ error: 'Ошибка добавления в корзину' })
  }
})

// DELETE /api/cart/:modelId
router.delete('/:modelId', authenticate, async (req, res) => {
  try {
    await db.query('DELETE FROM cart_items WHERE user_id = $1 AND model_id = $2', [req.user.id, req.params.modelId])
    res.json({ message: 'Товар удалён из корзины' })
  } catch (err) {
    res.status(500).json({ error: 'Ошибка удаления из корзины' })
  }
})

// DELETE /api/cart
router.delete('/', authenticate, async (req, res) => {
  try {
    await db.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id])
    res.json({ message: 'Корзина очищена' })
  } catch (err) {
    res.status(500).json({ error: 'Ошибка очистки корзины' })
  }
})

module.exports = router
