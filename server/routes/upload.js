const express = require('express')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const path = require('path')
const fs = require('fs')
const { authenticate, requireRole } = require('../middleware/auth')

const router = express.Router()

const UPLOADS_DIR = path.join(__dirname, '../../uploads')
fs.mkdirSync(path.join(UPLOADS_DIR, 'images'), { recursive: true })
fs.mkdirSync(path.join(UPLOADS_DIR, 'models'), { recursive: true })

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
})

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3001'

// POST /api/upload/image
router.post('/image', authenticate, requireRole('admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Файл не передан' })

    const ext = path.extname(req.file.originalname).toLowerCase()
    const allowed = ['.jpg', '.jpeg', '.png', '.webp']
    if (!allowed.includes(ext)) {
      return res.status(400).json({ error: 'Только JPG, PNG, WebP' })
    }

    const filename = `${uuidv4()}${ext}`
    fs.writeFileSync(path.join(UPLOADS_DIR, 'images', filename), req.file.buffer)

    const url = `${BASE_URL}/uploads/images/${filename}`
    res.json({ url })
  } catch (err) {
    console.error('Upload image error:', err.message)
    res.status(500).json({ error: 'Ошибка загрузки файла', detail: err.message })
  }
})

// POST /api/upload/model
router.post('/model', authenticate, requireRole('admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Файл не передан' })

    const ext = path.extname(req.file.originalname).toLowerCase()
    const allowed = ['.fbx', '.obj', '.glb', '.gltf', '.stl', '.blend', '.zip']
    if (!allowed.includes(ext)) {
      return res.status(400).json({ error: 'Неподдерживаемый формат 3D файла' })
    }

    const filename = `${uuidv4()}${ext}`
    fs.writeFileSync(path.join(UPLOADS_DIR, 'models', filename), req.file.buffer)

    const url = `${BASE_URL}/uploads/models/${filename}`
    res.json({ url, originalName: req.file.originalname, format: ext.replace('.', '').toUpperCase() })
  } catch (err) {
    console.error('Upload model error:', err.message)
    res.status(500).json({ error: 'Ошибка загрузки файла', detail: err.message })
  }
})

module.exports = router
