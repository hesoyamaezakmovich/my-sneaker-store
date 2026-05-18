/**
 * Скачивает реальные 3D-рендеры и загружает в cloud.ru бакет.
 * Polyhaven.com — CC0, настоящие 3D-рендеры.
 * Запуск: node database/upload-assets.cjs
 */

const nm = __dirname + '/../server/node_modules'
require(nm + '/dotenv').config({ path: __dirname + '/../server/.env' })
const https  = require('https')
const http   = require('http')
const { S3Client, PutObjectCommand } = require(nm + '/@aws-sdk/client-s3')

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region:   process.env.S3_REGION || 'ru-central-1',
  credentials: {
    accessKeyId: process.env.S3_TENANT_ID
      ? `${process.env.S3_TENANT_ID}:${process.env.S3_ACCESS_KEY_ID}`
      : process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.S3_SECRET_KEY_ID,
  },
  forcePathStyle: true,
})
const BUCKET     = process.env.S3_BUCKET
const PUBLIC_URL = process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT

// ── Источники изображений ──────────────────────────────────────────────────
// Polyhaven CDN — реальные 3D-рендеры, CC0
const PH = (slug) => `https://cdn.polyhaven.com/asset_img/renders/${slug}/1k.png`
// Unsplash — реальные фотографии (профессиональные, бесплатные)
const US = (id)   => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&h=600&q=85`

const ASSETS = [
  // ── Архитектура ────────────────────────────────────────────
  { key: 'arch-modern-house',    src: US('1512917774080-9991f1c4c750'), alt: 'https://picsum.photos/seed/arch1/800/600' },
  { key: 'arch-castle',          src: US('1558618047-3c8c76ca7d13'),    alt: 'https://picsum.photos/seed/arch2/800/600' },
  { key: 'arch-japan-temple',    src: US('1528360983277-13d401cdc186'), alt: 'https://picsum.photos/seed/arch3/800/600' },
  { key: 'arch-cottage',         src: US('1564013799919-ab600027ffc6'), alt: 'https://picsum.photos/seed/arch4/800/600' },
  { key: 'arch-skyscraper',      src: US('1486325212027-8081e485255e'), alt: 'https://picsum.photos/seed/arch5/800/600' },

  // ── Персонажи ──────────────────────────────────────────────
  { key: 'char-knight',          src: US('1561049501-ab81cdbd8dc5'),    alt: 'https://picsum.photos/seed/char1/800/600' },
  { key: 'char-cat',             src: US('1574158622682-e719686551c1'), alt: 'https://picsum.photos/seed/char2/800/600' },
  { key: 'char-scientist',       src: US('1582719508461-905c673536f6'), alt: 'https://picsum.photos/seed/char3/800/600' },
  { key: 'char-soldier',         src: US('1559827260-dc66d52bef19'),    alt: 'https://picsum.photos/seed/char4/800/600' },
  { key: 'char-female-base',     src: US('1531746020798-e6953c6e8e04'), alt: 'https://picsum.photos/seed/char5/800/600' },

  // ── Транспорт ──────────────────────────────────────────────
  { key: 'transport-sport-car',  src: US('1494976388531-d1058494cdd8'), alt: 'https://picsum.photos/seed/car1/800/600' },
  { key: 'transport-helicopter', src: US('1540575467063-178a50c2df87'), alt: 'https://picsum.photos/seed/heli1/800/600' },
  { key: 'transport-bus',        src: US('1544636331-e26879cd4d9b'),    alt: 'https://picsum.photos/seed/bus1/800/600' },
  { key: 'transport-moto',       src: US('1558618666-fcd25c85cd64'),    alt: 'https://picsum.photos/seed/moto1/800/600' },

  // ── Природа ────────────────────────────────────────────────
  { key: 'nature-trees',         src: PH('japanese_maple'),            alt: 'https://picsum.photos/seed/tree1/800/600' },
  { key: 'nature-mountain',      src: US('1464146072230-91cabc968dce'), alt: 'https://picsum.photos/seed/mount1/800/600' },
  { key: 'nature-coral',         src: US('1518020382113-a7ef8d37c56e'), alt: 'https://picsum.photos/seed/coral1/800/600' },

  // ── Интерьер ───────────────────────────────────────────────
  { key: 'interior-sofa',        src: PH('wooden_chair'),              alt: 'https://picsum.photos/seed/sofa1/800/600' },
  { key: 'interior-kitchen',     src: US('1556909114-f6e7ad7d3136'),    alt: 'https://picsum.photos/seed/kitch1/800/600' },
  { key: 'interior-desk',        src: PH('study_table_02'),            alt: 'https://picsum.photos/seed/desk1/800/600' },

  // ── Техника ────────────────────────────────────────────────
  { key: 'tech-robot',           src: US('1485827404703-89b55fcc595e'), alt: 'https://picsum.photos/seed/robot1/800/600' },
  { key: 'tech-drone',           src: US('1473968512647-3e447244af8f'), alt: 'https://picsum.photos/seed/drone1/800/600' },
  { key: 'tech-server',          src: US('1558494949-ef010cbdcc31'),    alt: 'https://picsum.photos/seed/server1/800/600' },

  // ── Оружие ─────────────────────────────────────────────────
  { key: 'weapon-sword',         src: US('1589128777073-263dc0f25d68'), alt: 'https://picsum.photos/seed/sword1/800/600' },
  { key: 'weapon-rifle',         src: US('1595590424283-b8f17842773f'), alt: 'https://picsum.photos/seed/rifle1/800/600' },

  // ── Еда ────────────────────────────────────────────────────
  { key: 'food-japanese',        src: PH('pineapple'),                 alt: 'https://picsum.photos/seed/food1/800/600' },
  { key: 'food-bread',           src: US('1509440159596-0280db65523f'), alt: 'https://picsum.photos/seed/bread1/800/600' },

  // ── Абстракция ─────────────────────────────────────────────
  { key: 'abstract-crystal',     src: US('1518640467707-6e573d1f4946'), alt: 'https://picsum.photos/seed/crystal1/800/600' },
]

// ── Скачивание с редиректами ───────────────────────────────────────────────
function download (url, redirects = 6) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RKS-Seed/1.0)',
        'Accept':     'image/*,*/*',
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        if (redirects <= 0) return reject(new Error('Too many redirects'))
        return resolve(download(res.headers.location, redirects - 1))
      }
      if (res.statusCode !== 200) {
        res.resume()
        return reject(new Error(`HTTP ${res.statusCode} → ${url}`))
      }
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => resolve({
        buffer:      Buffer.concat(chunks),
        contentType: res.headers['content-type'] || 'image/jpeg',
      }))
      res.on('error', reject)
    })
    req.on('error', reject)
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')) })
  })
}

// ── Загрузка в бакет ──────────────────────────────────────────────────────
async function upload (key, buffer, contentType) {
  await s3.send(new PutObjectCommand({
    Bucket:      BUCKET,
    Key:         key,
    Body:        buffer,
    ContentType: contentType,
  }))
  return `${PUBLIC_URL}/${BUCKET}/${key}`
}

// ── Главная функция ────────────────────────────────────────────────────────
async function main () {
  console.log(`\n🚀 Загружаем ${ASSETS.length} изображений в бакет ${BUCKET}\n`)

  const results = {}
  let ok = 0, fail = 0

  for (const asset of ASSETS) {
    const s3Key = `previews/${asset.key}.jpg`
    process.stdout.write(`  ↓ ${asset.key} ... `)

    // Пробуем основной источник, затем fallback
    for (const srcUrl of [asset.src, asset.alt]) {
      try {
        const { buffer, contentType } = await download(srcUrl)
        const url = await upload(s3Key, buffer, contentType)
        results[asset.key] = url
        process.stdout.write(`✅  (${(buffer.length / 1024).toFixed(0)} KB)\n`)
        ok++
        break
      } catch (e) {
        // пробуем fallback
        if (srcUrl === asset.alt) {
          process.stdout.write(`❌  ${e.message}\n`)
          results[asset.key] = `${PUBLIC_URL}/${BUCKET}/${s3Key}` // URL будет недоступен
          fail++
        }
      }
    }
  }

  console.log(`\n✅ Успешно: ${ok}  ❌ Ошибок: ${fail}`)
  console.log('\n📋 URL-карта (вставь в seed.cjs):\n')
  console.log('const URLS = ' + JSON.stringify(results, null, 2))
  console.log('\n🎉 Готово! Теперь обнови seed.cjs и запусти: node database/seed.cjs\n')
}

main().catch(console.error)
