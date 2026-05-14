require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

const authRouter = require('./routes/auth')
const modelsRouter = require('./routes/models')
const cartRouter = require('./routes/cart')
const ordersRouter = require('./routes/orders')
const adminRouter = require('./routes/admin')
const favoritesRouter = require('./routes/favorites')
const supportRouter = require('./routes/support')
const paymentsRouter = require('./routes/payments')
const uploadRouter = require('./routes/upload')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true }))

// Статические файлы загрузок (dev)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Маршруты API
app.use('/api/auth', authRouter)
app.use('/api/models', modelsRouter)
app.use('/api/cart', cartRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/admin', adminRouter)
app.use('/api/favorites', favoritesRouter)
app.use('/api/support', supportRouter)
app.use('/api/payments', paymentsRouter)
app.use('/api/upload', uploadRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'RKS 3D Marketplace API', time: new Date().toISOString() })
})

// Обработка 404
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' })
})

// Глобальный обработчик ошибок
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Внутренняя ошибка сервера' })
})

app.listen(PORT, () => {
  console.log(`🚀 RKS 3D Marketplace API запущен на http://localhost:${PORT}`)
})

module.exports = app
