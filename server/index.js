require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3')

const authRouter = require('./routes/auth')
const modelsRouter = require('./routes/models')
const cartRouter = require('./routes/cart')
const ordersRouter = require('./routes/orders')
const adminRouter = require('./routes/admin')
const favoritesRouter = require('./routes/favorites')
const supportRouter = require('./routes/support')
const paymentsRouter = require('./routes/payments')
const uploadRouter = require('./routes/upload')
const mediaRouter  = require('./routes/media')
const filesRouter  = require('./routes/files')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Статические файлы загрузок
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')))

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
app.use('/api/media',  mediaRouter)
app.use('/api/files',  filesRouter)

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
  applyS3Cors()
})

async function applyS3Cors() {
  const frontendUrl = (process.env.FRONTEND_URL || '').replace(/\/$/, '')
  if (!process.env.S3_BUCKET || !frontendUrl) return

  const s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || 'ru-central-1',
    credentials: {
      accessKeyId: process.env.S3_TENANT_ID
        ? `${process.env.S3_TENANT_ID}:${process.env.S3_ACCESS_KEY_ID}`
        : process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.S3_SECRET_KEY_ID,
    },
    forcePathStyle: true,
    requestChecksumCalculation: 'when_required',
    responseChecksumValidation: 'when_required',
  })

  try {
    await s3.send(new PutBucketCorsCommand({
      Bucket: process.env.S3_BUCKET,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: [frontendUrl],
            AllowedMethods: ['GET', 'PUT', 'HEAD'],
            AllowedHeaders: ['*'],
            ExposeHeaders: ['ETag'],
            MaxAgeSeconds: 300,
          },
        ],
      },
    }))
    console.log('✅ S3 CORS настроен для', frontendUrl)
  } catch (err) {
    console.error('⚠️  Не удалось настроить S3 CORS:', err.message)
  }
}

module.exports = app
