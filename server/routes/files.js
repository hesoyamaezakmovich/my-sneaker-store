const express = require('express')
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3')
const db = require('../db')

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

const S3_BUCKET = process.env.S3_BUCKET

// GET /api/files/download/:token
router.get('/download/:token', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT dt.expires_at,
              mf.file_name, mf.file_path, mf.file_format
       FROM download_tokens dt
       JOIN model_files mf ON mf.id = dt.model_file_id
       WHERE dt.token = $1`,
      [req.params.token]
    )

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Ссылка не найдена' })

    const row = result.rows[0]

    if (new Date(row.expires_at) < new Date())
      return res.status(410).json({ error: 'Ссылка устарела' })

    // Извлекаем S3 key из file_path
    // Возможные форматы:
    //   https://176-108-255-28.sslip.io/api/media/models/foo.fbx  → models/foo.fbx
    //   models/foo.fbx  → models/foo.fbx
    let s3Key = row.file_path || ''
    const mediaIdx = s3Key.indexOf('/api/media/')
    if (mediaIdx !== -1) {
      s3Key = s3Key.slice(mediaIdx + '/api/media/'.length)
    } else if (s3Key.startsWith('http')) {
      // Старый формат s3.cloud.ru: извлекаем часть после bucket name
      const bucketIdx = s3Key.indexOf(`/${S3_BUCKET}/`)
      s3Key = bucketIdx !== -1 ? s3Key.slice(bucketIdx + S3_BUCKET.length + 2) : ''
    }

    if (!s3Key) return res.status(500).json({ error: 'Неверный путь к файлу' })

    const obj = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: s3Key }))

    res.setHeader('Content-Disposition', `attachment; filename="${row.file_name}"`)
    res.setHeader('Content-Type', obj.ContentType || 'application/octet-stream')
    if (obj.ContentLength) res.setHeader('Content-Length', obj.ContentLength)

    obj.Body.pipe(res)
  } catch (err) {
    console.error('File download error:', err.message)
    res.status(500).json({ error: 'Ошибка скачивания файла' })
  }
})

module.exports = router
