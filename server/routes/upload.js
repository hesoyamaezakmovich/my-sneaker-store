const express = require('express')
const multer = require('multer')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const { v4: uuidv4 } = require('uuid')
const path = require('path')
const { authenticate, requireRole } = require('../middleware/auth')

const router = express.Router()

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'ru-central-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  forcePathStyle: true,
})

if (process.env.S3_TENANT_ID) {
  s3.middlewareStack.add(
    (next) => async (args) => {
      args.request.headers['x-amz-account-id'] = process.env.S3_TENANT_ID
      return next(args)
    },
    { step: 'build', name: 'tenantIdMiddleware' }
  )
}

const BUCKET = process.env.S3_BUCKET

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
})

// POST /api/upload/image — загрузка превью картинки
router.post('/image', authenticate, requireRole('admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Файл не передан' })

    const ext = path.extname(req.file.originalname).toLowerCase()
    const allowed = ['.jpg', '.jpeg', '.png', '.webp']
    if (!allowed.includes(ext)) {
      return res.status(400).json({ error: 'Только JPG, PNG, WebP' })
    }

    const key = `images/${uuidv4()}${ext}`
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }))

    const url = `${process.env.S3_ENDPOINT}/${BUCKET}/${key}`
    res.json({ url })
  } catch (err) {
    console.error('Upload image error:', err.message, err.Code, err.$metadata)
    res.status(500).json({ error: 'Ошибка загрузки файла', detail: err.message })
  }
})

// POST /api/upload/model — загрузка 3D файла
router.post('/model', authenticate, requireRole('admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Файл не передан' })

    const ext = path.extname(req.file.originalname).toLowerCase()
    const allowed = ['.fbx', '.obj', '.glb', '.gltf', '.stl', '.blend', '.zip']
    if (!allowed.includes(ext)) {
      return res.status(400).json({ error: 'Неподдерживаемый формат 3D файла' })
    }

    const key = `models/${uuidv4()}${ext}`
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }))

    const url = `${process.env.S3_ENDPOINT}/${BUCKET}/${key}`
    res.json({ url, originalName: req.file.originalname, format: ext.replace('.', '').toUpperCase() })
  } catch (err) {
    console.error('Upload model error:', err.message, err.Code, err.$metadata)
    res.status(500).json({ error: 'Ошибка загрузки файла', detail: err.message })
  }
})

module.exports = router
