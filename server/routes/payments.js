const express = require('express')
const crypto = require('crypto')
const db = require('../db')

const router = express.Router()

const generateLicenseKey = () =>
  'RKS-' + crypto.randomBytes(12).toString('hex').toUpperCase().match(/.{4}/g).join('-')

async function completeOrder(client, orderId, userId) {
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
    await client.query(
      'UPDATE models SET download_count = download_count + 1 WHERE id = $1',
      [item.model_id]
    )
  }
  await client.query(
    "UPDATE orders SET status = 'completed', updated_at = NOW() WHERE id = $1",
    [orderId]
  )
}

// POST /api/payments/webhook — уведомление от ЮKassa об оплате
router.post('/webhook', async (req, res) => {
  try {
    const { event, object } = req.body

    if (event !== 'payment.succeeded') {
      return res.status(200).send('ok')
    }

    const orderId = object?.metadata?.order_id
    if (!orderId) {
      return res.status(400).json({ error: 'Нет order_id в metadata' })
    }

    const client = await db.getClient()
    try {
      await client.query('BEGIN')

      const orderResult = await client.query(
        "SELECT * FROM orders WHERE id = $1 AND status = 'pending_payment'",
        [orderId]
      )

      if (orderResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return res.status(200).send('ok')
      }

      const order = orderResult.rows[0]

      await client.query(
        "UPDATE orders SET status = 'paid', updated_at = NOW() WHERE id = $1",
        [order.id]
      )
      await completeOrder(client, order.id, order.user_id)

      await client.query('COMMIT')
      console.log(`Order ${order.id} paid via YooKassa`)
    } catch (err) {
      await client.query('ROLLBACK')
      console.error('Webhook processing error:', err)
      return res.status(500).json({ error: 'Ошибка обработки платежа' })
    } finally {
      client.release()
    }

    res.status(200).send('ok')
  } catch (err) {
    console.error('Webhook error:', err)
    res.status(500).json({ error: 'Внутренняя ошибка' })
  }
})

module.exports = router
