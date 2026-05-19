const express = require('express')
const multer  = require('multer')
const { v4: uuidv4 } = require('uuid')
const path    = require('path')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const { authenticate, requireRole } = require('../middleware/auth')

const router = express.Router()

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region:   process.env.S3_REGION || 'ru-central-1',
  credentials: {
    accessKeyId:     process.env.S3_TENANT_ID
      ? `${process.env.S3_TENANT_ID}:${process.env.S3_ACCESS_KEY_ID}`
      : process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.S3_SECRET_KEY_ID,
  },
  forcePathStyle: true,
})

const S3_BUCKET    = process.env.S3_BUCKET
const MEDIA_PREFIX = (process.env.FRONTEND_URL || '').replace(/\/$/, '') + '/api/media'

const MODEL_EXTS = ['.fbx', '.obj', '.glb', '.gltf', '.stl', '.blend', '.zip']
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp']

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 500 * 1024 * 1024 },
})

// POST /api/upload/image — загрузка через сервер (небольшие файлы, до ~50MB)
router.post('/image', authenticate, requireRole('admin', 'author'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Файл не передан' })

    const ext = path.extname(req.file.originalname).toLowerCase()
    if (!IMAGE_EXTS.includes(ext))
      return res.status(400).json({ error: 'Только JPG, PNG, WebP' })

    const key = `images/${uuidv4()}${ext}`
    await s3.send(new PutObjectCommand({
      Bucket:      S3_BUCKET,
      Key:         key,
      Body:        req.file.buffer,
      ContentType: req.file.mimetype,
      ACL:         'public-read',
    }))

    res.json({ url: `${MEDIA_PREFIX}/${key}` })
  } catch (err) {
    console.error('Upload image error:', err.message)
    res.status(500).json({ error: 'Ошибка загрузки файла', detail: err.message })
  }
})

// POST /api/upload/model — загрузка через сервер (оставлен для совместимости)
router.post('/model', authenticate, requireRole('admin', 'author'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Файл не передан' })

    const ext = path.extname(req.file.originalname).toLowerCase()
    if (!MODEL_EXTS.includes(ext))
      return res.status(400).json({ error: 'Неподдерживаемый формат 3D файла' })

    const key = `models/${uuidv4()}${ext}`
    await s3.send(new PutObjectCommand({
      Bucket:      S3_BUCKET,
      Key:         key,
      Body:        req.file.buffer,
      ContentType: req.file.mimetype || 'application/octet-stream',
      ACL:         'public-read',
    }))

    const url = `${MEDIA_PREFIX}/${key}`
    res.json({ url, originalName: req.file.originalname, format: ext.replace('.', '').toUpperCase() })
  } catch (err) {
    console.error('Upload model error:', err.message)
    res.status(500).json({ error: 'Ошибка загрузки файла', detail: err.message })
  }
})

// GET /api/upload/model-presign?filename=model.glb
// Возвращает presigned PUT URL для прямой загрузки в S3 из браузера (минуя nginx)
router.get('/model-presign', authenticate, requireRole('admin', 'author'), async (req, res) => {
  try {
    const { filename } = req.query
    if (!filename) return res.status(400).json({ error: 'Параметр filename обязателен' })

    const ext = path.extname(filename).toLowerCase()
    if (!MODEL_EXTS.includes(ext))
      return res.status(400).json({ error: 'Неподдерживаемый формат 3D файла' })

    const key = `models/${uuidv4()}${ext}`
    const command = new PutObjectCommand({
      Bucket:      S3_BUCKET,
      Key:         key,
      ContentType: 'application/octet-stream',
      ACL:         'public-read',
    })

    // presigned URL действует 15 минут
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 900 })
    const resultUrl = `${MEDIA_PREFIX}/${key}`

    res.json({ presignedUrl, url: resultUrl, key, originalName: filename, format: ext.replace('.', '').toUpperCase() })
  } catch (err) {
    console.error('Presign error:', err.message)
    res.status(500).json({ error: 'Ошибка генерации ссылки', detail: err.message })
  }
})

module.exports = router
