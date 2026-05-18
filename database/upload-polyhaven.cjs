/**
 * Скачивает CC0 3D-модели с Polyhaven → cloud.ru бакет
 * node database/upload-polyhaven.cjs
 */

const https = require('https')
const http  = require('http')

function tryRequire(pkg) {
  for (const p of [__dirname + '/../server/node_modules/' + pkg, __dirname + '/../node_modules/' + pkg]) {
    try { return require(p) } catch {}
  }
  throw new Error(`"${pkg}" не найден. Запусти: cd server && npm install`)
}

const dotenv = tryRequire('dotenv')
dotenv.config({ path: __dirname + '/../server/.env' })
dotenv.config({ path: __dirname + '/../.env' })

const { S3Client, PutObjectCommand } = tryRequire('@aws-sdk/client-s3')

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
const BUCKET     = process.env.S3_BUCKET
const PUBLIC_URL = (process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT).replace(/\/$/, '')

const WANT = 20

function download(url, redirects = 8) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http
    const req = mod.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 RKS-Diploma/1.0', Accept: '*/*' },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume()
        if (redirects <= 0) return reject(new Error('Too many redirects'))
        return resolve(download(res.headers.location, redirects - 1))
      }
      if (res.statusCode !== 200) {
        res.resume()
        return reject(new Error(`HTTP ${res.statusCode}`))
      }
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end',  () => resolve({ buffer: Buffer.concat(chunks), ct: res.headers['content-type'] || '' }))
      res.on('error', reject)
    })
    req.on('error', reject)
    req.setTimeout(120000, () => { req.destroy(); reject(new Error('Timeout')) })
  })
}

async function fetchJson(url) {
  const { buffer } = await download(url)
  return JSON.parse(buffer.toString())
}

async function uploadS3(key, buffer, ct) {
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: ct }))
  return `${PUBLIC_URL}/${BUCKET}/${key}`
}

// Рекурсивно ищем первый файл нужного расширения в объекте любой вложенности
function findFile(obj, exts) {
  if (!obj || typeof obj !== 'object') return null
  // Если это объект с url и size — это файл
  if (obj.url && obj.size !== undefined) {
    const ext = obj.url.split('?')[0].split('.').pop().toLowerCase()
    if (exts.includes(ext)) return { url: obj.url, ext }
  }
  for (const val of Object.values(obj)) {
    const found = findFile(val, exts)
    if (found) return found
  }
  return null
}

async function main() {
  console.log('\n🌿 Polyhaven → cloud.ru бакет\n')

  // Дебаг: смотрим структуру файлов одной модели
  console.log('🔍 Проверяем структуру API на примере modern_arm_chair_01...')
  try {
    const sample = await fetchJson('https://api.polyhaven.com/files/modern_arm_chair_01')
    console.log('   Доступные форматы:', Object.keys(sample).join(', '))
    // Показываем первый уровень вложенности
    for (const [fmt, data] of Object.entries(sample)) {
      const qualities = Object.keys(data)
      console.log(`   ${fmt}: [${qualities.join(', ')}]`)
    }
  } catch (e) {
    console.log('   ⚠️', e.message)
  }
  console.log()

  console.log('📡 Загружаем список моделей...')
  const allAssets = await fetchJson('https://api.polyhaven.com/assets?t=models')
  const slugs = Object.keys(allAssets).sort(() => Math.random() - 0.5)
  console.log(`   ${slugs.length} моделей доступно\n`)

  const results = []
  let tried = 0

  for (const slug of slugs) {
    if (results.length >= WANT) break
    tried++

    const asset    = allAssets[slug]
    const category = asset.categories?.[0] || 'misc'
    process.stdout.write(`[${results.length + 1}/${WANT}] ${slug} ... `)

    let previewUrl = null
    let modelUrl   = null
    let modelExt   = 'glb'

    // 1. Превью
    for (const src of [
      `https://cdn.polyhaven.com/asset_img/renders/${slug}/1k.png`,
      `https://cdn.polyhaven.com/asset_img/thumbs/${slug}.png?height=780`,
    ]) {
      try {
        const { buffer, ct } = await download(src)
        if (buffer.length > 5000) { // не пустой ответ
          previewUrl = await uploadS3(`previews/${slug}.png`, buffer, ct || 'image/png')
          break
        }
      } catch {}
    }

    // 2. 3D-файл — ищем glb/fbx/obj в любом месте ответа
    try {
      const files = await fetchJson(`https://api.polyhaven.com/files/${slug}`)

      // Предпочитаем: glb > fbx > obj > blend
      const found = findFile(files, ['glb']) ||
                    findFile(files, ['fbx']) ||
                    findFile(files, ['obj']) ||
                    findFile(files, ['blend'])

      if (found) {
        const { buffer } = await download(found.url)
        modelExt   = found.ext
        const contentTypes = {
          glb:   'model/gltf-binary',
          fbx:   'application/octet-stream',
          obj:   'text/plain',
          blend: 'application/octet-stream',
        }
        modelUrl = await uploadS3(
          `models/${slug}.${found.ext}`,
          buffer,
          contentTypes[found.ext] || 'application/octet-stream'
        )
      }
    } catch (e) {
      // молча пропускаем
    }

    if (!previewUrl && !modelUrl) {
      process.stdout.write('⏭  пропущено\n')
      continue
    }

    const icons = (previewUrl ? '🖼 ' : '   ') + (modelUrl ? `📦.${modelExt}` : '   ')
    process.stdout.write(`${icons} ✅\n`)

    results.push({
      slug,
      name:       asset.name || slug,
      category,
      previewUrl: previewUrl || '',
      modelUrl:   modelUrl   || '',
      modelExt,
      tags:       (asset.tags || []).slice(0, 5),
    })

    await new Promise(r => setTimeout(r, 300))
  }

  console.log(`\n🏁 Загружено ${results.length} из ${tried} попыток`)
  const withModel = results.filter(r => r.modelUrl).length
  console.log(`   🖼  превью: ${results.filter(r => r.previewUrl).length}`)
  console.log(`   📦 3D файлы: ${withModel}`)
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('const POLYHAVEN = ' + JSON.stringify(results, null, 2))
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main().catch(err => { console.error('❌', err.message); process.exit(1) })
