const express = require('express')
const crypto = require('crypto')
const https = require('https')
const { v4: uuidv4 } = require('uuid')
const db = require('../db')
const { authenticate, requireRole } = require('../middleware/auth')

function createYookassaPayment({ amount, orderId, orderNumber }) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      amount: { value: amount.toFixed(2), currency: 'RUB' },
      confirmation: {
        type: 'redirect',
        return_url: `${process.env.FRONTEND_URL}/orders`,
      },
      capture: true,
      description: `Заказ ${orderNumber}`,
      metadata: { order_id: String(orderId) },
    })

    const auth = Buffer.from(
      `${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`
    ).toString('base64')

    const options = {
      hostname: 'api.yookassa.ru',
      path: '/v3/payments',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': String(orderId),
        Authorization: `Basic ${auth}`,
      },
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          if (res.statusCode >= 400) {
            reject(new Error(parsed.description || 'Ошибка ЮKassa'))
          } else {
            resolve(parsed)
          }
        } catch (e) {
          reject(e)
        }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

const router = express.Router()

const generateOrderNumber = () => {
  const date = new Date()
  const datePart = date.getFullYear().toString().slice(-2) +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0')
  const randomPart = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
  return `RKS-${datePart}-${randomPart}`
}

const generateLicenseKey = () => {
  return 'RKS-' + crypto.randomBytes(12).toString('hex').toUpperCase().match(/.{4}/g).join('-')
}

const DOWNLOAD_TTL_HOURS = parseInt(process.env.DOWNLOAD_LINK_TTL_HOURS || '72')

// POST /api/orders - создать заказ из корзины
router.post('/', authenticate, async (req, res) => {
  const client = await db.getClient()
  try {
    await client.query('BEGIN')

    // Получаем корзину
    const cartResult = await client.query(
      `SELECT ci.model_id, m.title, m.price, m.is_free, m.preview_image_url, m.author_id, m.status
       FROM cart_items ci JOIN models m ON m.id = ci.model_id
       WHERE ci.user_id = $1 AND m.status = 'published'`,
      [req.user.id]
    )

    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: 'Корзина пуста' })
    }

    const items = cartResult.rows
    const totalAmount = items.reduce((sum, item) => sum + (item.is_free ? 0 : parseFloat(item.price)), 0)
    const orderNumber = generateOrderNumber()

    // Создаём заказ
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, order_number, total_amount, status)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, orderNumber, totalAmount, totalAmount === 0 ? 'paid' : 'pending_payment']
    )
    const order = orderResult.rows[0]

    // Создаём позиции заказа
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, model_id, model_title, model_preview_url, author_id, price, license_type)
         VALUES ($1, $2, $3, $4, $5, $6, 'standard')`,
        [order.id, item.model_id, item.title, item.preview_image_url, item.author_id, item.is_free ? 0 : item.price]
      )
    }

    // Если заказ бесплатный — сразу генерируем лицензии
    if (order.status === 'paid') {
      await completeFreeOrder(client, order.id, req.user.id)
      await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id])
      await client.query('COMMIT')
      return res.status(201).json({ order })
    }

    // Платный заказ — создаём платёж в ЮKassa
    let confirmationUrl = null
    try {
      const payment = await createYookassaPayment({
        amount: totalAmount,
        orderId: order.id,
        orderNumber,
      })
      await client.query(
        'UPDATE orders SET yookassa_payment_id = $1 WHERE id = $2',
        [payment.id, order.id]
      )
      confirmationUrl = payment.confirmation.confirmation_url
    } catch (paymentErr) {
      console.error('YooKassa payment creation error:', paymentErr)
    }

    // Очищаем корзину
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id])
    await client.query('COMMIT')

    res.status(201).json({ order, confirmation_url: confirmationUrl })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Create order error:', err)
    res.status(500).json({ error: 'Ошибка создания заказа' })
  } finally {
    client.release()
  }
})

async function completeFreeOrder(client, orderId, userId) {
  const itemsResult = await client.query(
    'SELECT oi.id, oi.model_id FROM order_items oi WHERE oi.order_id = $1',
    [orderId]
  )
  for (const item of itemsResult.rows) {
    const licenseKey = generateLicenseKey()
    await client.query(
      `INSERT INTO licenses (order_item_id, user_id, model_id, license_key, license_type, is_active)
       VALUES ($1, $2, $3, $4, 'standard', TRUE) ON CONFLICT DO NOTHING`,
      [item.id, userId, item.model_id, licenseKey]
    )
    await client.query('UPDATE models SET download_count = download_count + 1 WHERE id = $1', [item.model_id])
  }
  await client.query("UPDATE orders SET status = 'completed', updated_at = NOW() WHERE id = $1", [orderId])
}

// POST /api/orders/:id/complete - подтвердить оплату (webhook / admin)
router.post('/:id/complete', authenticate, requireRole('admin'), async (req, res) => {
  const client = await db.getClient()
  try {
    await client.query('BEGIN')

    const orderResult = await client.query('SELECT * FROM orders WHERE id = $1', [req.params.id])
    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Заказ не найден' })
    }
    const order = orderResult.rows[0]
    if (order.status !== 'pending_payment') {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: 'Заказ не находится в статусе ожидания оплаты' })
    }

    await client.query("UPDATE orders SET status = 'paid', updated_at = NOW() WHERE id = $1", [order.id])
    await completeFreeOrder(client, order.id, order.user_id)
    await client.query('COMMIT')

    res.json({ message: 'Заказ оплачен, лицензии выданы' })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Complete order error:', err)
    res.status(500).json({ error: 'Ошибка завершения заказа' })
  } finally {
    client.release()
  }
})

// GET /api/orders - заказы текущего пользователя
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT o.*,
        json_agg(json_build_object(
          'id', oi.id, 'model_id', oi.model_id, 'model_title', oi.model_title,
          'model_preview_url', oi.model_preview_url, 'price', oi.price, 'license_type', oi.license_type,
          'license_key', l.license_key, 'license_id', l.id
        )) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN licenses l ON l.order_item_id = oi.id AND l.is_active = TRUE
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    )
    res.json({ orders: result.rows })
  } catch (err) {
    console.error('Get orders error:', err)
    res.status(500).json({ error: 'Ошибка получения заказов' })
  }
})

// GET /api/orders/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT o.*,
        json_agg(json_build_object(
          'id', oi.id, 'model_id', oi.model_id, 'model_title', oi.model_title,
          'model_preview_url', oi.model_preview_url, 'price', oi.price,
          'license_key', l.license_key, 'license_id', l.id
        )) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN licenses l ON l.order_item_id = oi.id AND l.is_active = TRUE
       WHERE o.id = $1 AND (o.user_id = $2 OR $3 = 'admin')
       GROUP BY o.id`,
      [req.params.id, req.user.id, req.user.role]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Заказ не найден' })
    res.json({ order: result.rows[0] })
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' })
  }
})

// GET /api/orders/downloads/:licenseId - получить ссылку для скачивания
router.get('/downloads/:licenseId', authenticate, async (req, res) => {
  try {
    const licenseResult = await db.query(
      'SELECT * FROM licenses WHERE id = $1 AND user_id = $2 AND is_active = TRUE',
      [req.params.licenseId, req.user.id]
    )
    if (licenseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Лицензия не найдена' })
    }

    const filesResult = await db.query(
      'SELECT id, file_name, file_format FROM model_files WHERE model_id = $1',
      [licenseResult.rows[0].model_id]
    )

    // Генерируем download tokens для каждого файла
    const tokens = []
    const expiresAt = new Date(Date.now() + DOWNLOAD_TTL_HOURS * 60 * 60 * 1000)
    for (const file of filesResult.rows) {
      const token = uuidv4()
      await db.query(
        'INSERT INTO download_tokens (license_id, model_file_id, token, expires_at) VALUES ($1, $2, $3, $4)',
        [req.params.licenseId, file.id, token, expiresAt]
      )
      tokens.push({
        file_id: file.id,
        file_name: file.file_name,
        file_format: file.file_format,
        download_url: `/api/files/download/${token}`,
        expires_at: expiresAt,
      })
    }

    res.json({ files: tokens })
  } catch (err) {
    console.error('Generate download links error:', err)
    res.status(500).json({ error: 'Ошибка генерации ссылок' })
  }
})

module.exports = router
