const express = require('express')
const multer  = require('multer')
const { v4: uuidv4 } = require('uuid')
const path    = require('path')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
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

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 500 * 1024 * 1024 },
})

// POST /api/upload/image
router.post('/image', authenticate, requireRole('admin', 'author'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Файл не передан' })

    const ext = path.extname(req.file.originalname).toLowerCase()
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext))
      return res.status(400).json({ error: 'Только JPG, PNG, WebP' })

    const key = `images/${uuidv4()}${ext}`
    await s3.send(new PutObjectCommand({
      Bucket:      S3_BUCKET,
      Key:         key,
      Body:        req.file.buffer,
      ContentType: req.file.mimetype,
      ACL:         'public-read',
    }))

    const url = `${MEDIA_PREFIX}/${key}`
    res.json({ url })
  } catch (err) {
    console.error('Upload image error:', err.message)
    res.status(500).json({ error: 'Ошибка загрузки файла', detail: err.message })
  }
})

// POST /api/upload/model
router.post('/model', authenticate, requireRole('admin', 'author'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Файл не передан' })

    const ext = path.extname(req.file.originalname).toLowerCase()
    if (!['.fbx', '.obj', '.glb', '.gltf', '.stl', '.blend', '.zip'].includes(ext))
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

module.exports = router
