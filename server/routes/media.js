const express = require('express')
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3')

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

// GET /api/media/previews/foo.png
// GET /api/media/models/foo.fbx
router.get('/*', async (req, res) => {
  const key = req.params[0]
  if (!key) return res.status(400).end()

  try {
    const obj = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }))
    res.setHeader('Content-Type', obj.ContentType || 'application/octet-stream')
    res.setHeader('Cache-Control', 'public, max-age=86400')
    if (obj.ContentLength) res.setHeader('Content-Length', obj.ContentLength)
    obj.Body.pipe(res)
  } catch (err) {
    if (err.name === 'NoSuchKey') return res.status(404).end()
    console.error('Media proxy error:', err.message)
    res.status(500).end()
  }
})

module.exports = router
