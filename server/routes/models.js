const express = require('express')
const db = require('../db')
const { authenticate, requireRole, optionalAuth } = require('../middleware/auth')

const router = express.Router()

const MODEL_SELECT = `
  m.*,
  u.email AS author_email,
  p.display_name AS author_name,
  p.avatar_url AS author_avatar,
  c.name AS category_name,
  c.slug AS category_slug,
  COALESCE(
    json_agg(DISTINCT jsonb_build_object('id', mi.id, 'image_url', mi.image_url, 'is_primary', mi.is_primary, 'sort_order', mi.sort_order))
    FILTER (WHERE mi.id IS NOT NULL), '[]'
  ) AS images,
  COALESCE(
    json_agg(DISTINCT jsonb_build_object('id', mf.id, 'file_format', mf.file_format, 'file_size_bytes', mf.file_size_bytes, 'file_name', mf.file_name))
    FILTER (WHERE mf.id IS NOT NULL), '[]'
  ) AS files,
  COALESCE(
    json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug))
    FILTER (WHERE t.id IS NOT NULL), '[]'
  ) AS tags
`

// GET /api/models - список опубликованных моделей
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, tag, priceMin, priceMax, sort = 'newest', search, limit = 20, offset = 0, isFree } = req.query

    let where = ["m.status = 'published'"]
    const params = []

    if (category) {
      params.push(category)
      where.push(`c.slug = $${params.length}`)
    }
    if (tag) {
      params.push(tag)
      where.push(`EXISTS (SELECT 1 FROM model_tags mt2 JOIN tags t2 ON t2.id = mt2.tag_id WHERE mt2.model_id = m.id AND t2.slug = $${params.length})`)
    }
    if (priceMin) {
      params.push(parseFloat(priceMin))
      where.push(`m.price >= $${params.length}`)
    }
    if (priceMax) {
      params.push(parseFloat(priceMax))
      where.push(`m.price <= $${params.length}`)
    }
    if (isFree === 'true') {
      where.push(`m.is_free = TRUE`)
    }
    if (search) {
      params.push(`%${search}%`)
      where.push(`(m.title ILIKE $${params.length} OR m.description ILIKE $${params.length})`)
    }

    const orderMap = {
      newest: 'm.created_at DESC',
      oldest: 'm.created_at ASC',
      price_asc: 'm.price ASC',
      price_desc: 'm.price DESC',
      popular: 'm.download_count DESC',
      rating: 'm.rating_avg DESC',
    }
    const orderBy = orderMap[sort] || 'm.created_at DESC'

    params.push(parseInt(limit), parseInt(offset))

    const query = `
      SELECT ${MODEL_SELECT}
      FROM models m
      JOIN users u ON u.id = m.author_id
      LEFT JOIN profiles p ON p.id = m.author_id
      LEFT JOIN categories c ON c.id = m.category_id
      LEFT JOIN model_images mi ON mi.model_id = m.id
      LEFT JOIN model_files mf ON mf.model_id = m.id
      LEFT JOIN model_tags mt ON mt.model_id = m.id
      LEFT JOIN tags t ON t.id = mt.tag_id
      WHERE ${where.join(' AND ')}
      GROUP BY m.id, u.email, p.display_name, p.avatar_url, c.name, c.slug
      ORDER BY ${orderBy}
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `

    const countQuery = `
      SELECT COUNT(DISTINCT m.id) AS total
      FROM models m
      LEFT JOIN categories c ON c.id = m.category_id
      WHERE ${where.join(' AND ')}
    `

    const [rows, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, params.slice(0, -2)),
    ])

    res.json({
      models: rows.rows,
      total: parseInt(countResult.rows[0].total),
      limit: parseInt(limit),
      offset: parseInt(offset),
    })
  } catch (err) {
    console.error('Get models error:', err)
    res.status(500).json({ error: 'Ошибка получения моделей' })
  }
})

// GET /api/models/categories
router.get('/meta/categories', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categories WHERE is_active = TRUE ORDER BY sort_order')
    res.json({ categories: result.rows })
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения категорий' })
  }
})

// GET /api/models/meta/tags
router.get('/meta/tags', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM tags ORDER BY name')
    res.json({ tags: result.rows })
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения тегов' })
  }
})

// GET /api/models/author/:authorId - модели автора
router.get('/author/:authorId', optionalAuth, async (req, res) => {
  try {
    const isOwner = req.user?.id === req.params.authorId || req.user?.role === 'admin'
    const statusFilter = isOwner ? '' : "AND m.status = 'published'"

    const result = await db.query(
      `SELECT m.id, m.title, m.price, m.status, m.preview_image_url, m.download_count, m.rating_avg, m.created_at
       FROM models m
       WHERE m.author_id = $1 ${statusFilter}
       ORDER BY m.created_at DESC`,
      [req.params.authorId]
    )
    res.json({ models: result.rows })
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' })
  }
})

// GET /api/models/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT ${MODEL_SELECT}
       FROM models m
       JOIN users u ON u.id = m.author_id
       LEFT JOIN profiles p ON p.id = m.author_id
       LEFT JOIN categories c ON c.id = m.category_id
       LEFT JOIN model_images mi ON mi.model_id = m.id
       LEFT JOIN model_files mf ON mf.model_id = m.id
       LEFT JOIN model_tags mt ON mt.model_id = m.id
       LEFT JOIN tags t ON t.id = mt.tag_id
       WHERE m.id = $1 AND (m.status = 'published' OR $2::uuid = m.author_id)
       GROUP BY m.id, u.email, p.display_name, p.avatar_url, c.name, c.slug`,
      [req.params.id, req.user?.id || null]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Модель не найдена' })
    }

    // Увеличиваем счётчик просмотров
    await db.query('UPDATE models SET view_count = view_count + 1 WHERE id = $1', [req.params.id])

    res.json({ model: result.rows[0] })
  } catch (err) {
    console.error('Get model error:', err)
    res.status(500).json({ error: 'Ошибка получения модели' })
  }
})

// GET /api/models/:id/similar
router.get('/:id/similar', async (req, res) => {
  try {
    const modelResult = await db.query('SELECT category_id FROM models WHERE id = $1', [req.params.id])
    if (modelResult.rows.length === 0) return res.status(404).json({ error: 'Модель не найдена' })

    const { category_id } = modelResult.rows[0]
    const result = await db.query(
      `SELECT m.id, m.title, m.price, m.preview_image_url, m.rating_avg, m.download_count
       FROM models m
       WHERE m.status = 'published' AND m.category_id = $1 AND m.id != $2
       ORDER BY m.rating_avg DESC LIMIT 4`,
      [category_id, req.params.id]
    )
    res.json({ models: result.rows })
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' })
  }
})

// POST /api/models - создать модель (автор)
router.post('/', authenticate, requireRole('author', 'admin'), async (req, res) => {
  const { title, description, price, categoryId, isFree, licenseType, polygonCount, softwareUsed, tags } = req.body

  if (!title) return res.status(400).json({ error: 'Название обязательно' })

  try {
    const result = await db.query(
      `INSERT INTO models (author_id, category_id, title, description, price, is_free, license_type, polygon_count, software_used, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'draft')
       RETURNING *`,
      [req.user.id, categoryId || null, title, description, price || 0, isFree || false, licenseType || 'standard', polygonCount || null, softwareUsed || null]
    )
    const model = result.rows[0]

    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tagId of tags) {
        await db.query('INSERT INTO model_tags (model_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [model.id, tagId])
      }
    }

    res.status(201).json({ model })
  } catch (err) {
    console.error('Create model error:', err)
    res.status(500).json({ error: 'Ошибка создания модели' })
  }
})

// PATCH /api/models/:id
router.patch('/:id', authenticate, async (req, res) => {
  const { title, description, price, categoryId, isFree, licenseType, polygonCount, softwareUsed, tags, status } = req.body

  try {
    const existing = await db.query('SELECT * FROM models WHERE id = $1', [req.params.id])
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Модель не найдена' })

    const model = existing.rows[0]
    if (model.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Нет прав для редактирования' })
    }

    // Автор может только отправить на модерацию или сохранить черновик
    let newStatus = status
    if (req.user.role !== 'admin' && status && !['draft', 'pending_review'].includes(status)) {
      newStatus = model.status
    }

    const result = await db.query(
      `UPDATE models SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        category_id = COALESCE($4, category_id),
        is_free = COALESCE($5, is_free),
        license_type = COALESCE($6, license_type),
        polygon_count = COALESCE($7, polygon_count),
        software_used = COALESCE($8, software_used),
        status = COALESCE($9, status),
        updated_at = NOW()
       WHERE id = $10 RETURNING *`,
      [title, description, price, categoryId, isFree, licenseType, polygonCount, softwareUsed, newStatus, req.params.id]
    )

    if (tags && Array.isArray(tags)) {
      await db.query('DELETE FROM model_tags WHERE model_id = $1', [req.params.id])
      for (const tagId of tags) {
        await db.query('INSERT INTO model_tags (model_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.params.id, tagId])
      }
    }

    res.json({ model: result.rows[0] })
  } catch (err) {
    console.error('Update model error:', err)
    res.status(500).json({ error: 'Ошибка обновления модели' })
  }
})

// DELETE /api/models/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const existing = await db.query('SELECT author_id FROM models WHERE id = $1', [req.params.id])
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Модель не найдена' })
    if (existing.rows[0].author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Нет прав' })
    }
    await db.query('DELETE FROM models WHERE id = $1', [req.params.id])
    res.json({ message: 'Модель удалена' })
  } catch (err) {
    res.status(500).json({ error: 'Ошибка удаления модели' })
  }
})

module.exports = router
