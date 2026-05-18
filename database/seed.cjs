/**
 * Seed: тестовые данные для дипломного проекта РКС 3D Маркетплейс
 *
 * Порядок запуска:
 *  1. node database/upload-polyhaven.cjs  ← скачивает реальные модели в бакет
 *  2. node database/seed.cjs              ← заполняет БД с реальными URL
 *
 * Только seed без загрузки:
 *  node database/seed.cjs
 *
 * Пользователи:
 *   admin@rks.ru     / Admin1234   (admin)
 *   author1@rks.ru   / Author1234  (author)
 *   author2@rks.ru   / Author1234  (author)
 *   buyer1@rks.ru    / Buyer1234   (buyer)
 *   buyer2@rks.ru    / Buyer1234   (buyer)
 */

const nm = __dirname + '/../server/node_modules'
require(nm + '/dotenv').config({ path: __dirname + '/../server/.env' })
const { Pool }  = require(nm + '/pg')
const bcrypt    = require(nm + '/bcryptjs')
const { v4: uuidv4 } = require(nm + '/uuid')

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'rks_3d_marketplace',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
})

// Реальные модели с Polyhaven (CC0), загружены в cloud.ru бакет
const MODELS = [
  // ── Interieur / Furniture ────────────────────────────────
  {
    cat: 'interior', author: 1,
    title: 'Painted Wooden Chair 02',
    desc: 'Антикварный деревянный стул с потёртой краской. PBR-текстуры, CC0 лицензия.',
    price: 0, free: true, poly: 12000, sw: 'Blender', lic: 'free',
    dl: 234, views: 1820, rating: 4.5, rc: 31, feat: true,
    img1: 'https://176-108-255-28.sslip.io/api/media/previews/painted_wooden_chair_02.png',
    modelUrl: 'https://176-108-255-28.sslip.io/api/media/models/painted_wooden_chair_02.fbx',
    modelExt: 'fbx',
    tags: ['pbr', 'textures-included', 'realistic'],
  },
  // ── Nature / Plants ──────────────────────────────────────
  {
    cat: 'nature', author: 2,
    title: 'Fir Sapling Medium',
    desc: 'Молодая ель с реалистичной хвоей. Отличная основа для лесных сцен.',
    price: 0, free: true, poly: 8500, sw: 'Blender', lic: 'free',
    dl: 512, views: 4300, rating: 4.4, rc: 67, feat: false,
    img1: 'https://176-108-255-28.sslip.io/api/media/previews/fir_sapling_medium.png',
    modelUrl: 'https://176-108-255-28.sslip.io/api/media/models/fir_sapling_medium.fbx',
    modelExt: 'fbx',
    tags: ['low-poly', 'game-ready', 'realtime'],
  },
  // ── Props / Abstract ─────────────────────────────────────
  {
    cat: 'abstract', author: 1,
    title: 'Megaphone 01',
    desc: 'Детализированный мегафон с пластиковым корпусом и металлической решёткой.',
    price: 650, free: false, poly: 6200, sw: 'Blender', lic: 'standard',
    dl: 88, views: 720, rating: 4.3, rc: 17, feat: false,
    img1: 'https://176-108-255-28.sslip.io/api/media/previews/Megaphone_01.png',
    modelUrl: 'https://176-108-255-28.sslip.io/api/media/models/Megaphone_01.fbx',
    modelExt: 'fbx',
    tags: ['pbr', 'textures-included'],
  },
  // ── Architecture ─────────────────────────────────────────
  {
    cat: 'architecture', author: 1,
    title: 'Large Castle Door',
    desc: 'Массивные ворота средневекового замка с окованием и петлями. Готово к анимации.',
    price: 2800, free: false, poly: 45000, sw: 'Blender', lic: 'extended',
    dl: 18, views: 195, rating: 4.9, rc: 7, feat: true,
    img1: 'https://176-108-255-28.sslip.io/api/media/previews/large_castle_door.png',
    modelUrl: 'https://176-108-255-28.sslip.io/api/media/models/large_castle_door.fbx',
    modelExt: 'fbx',
    tags: ['high-poly', 'textures-included', 'fantasy'],
  },
  // ── Nature / Grass ───────────────────────────────────────
  {
    cat: 'nature', author: 2,
    title: 'Grass Medium 01',
    desc: 'Реалистичная трава средней высоты. Оптимизирована для игровых движков.',
    price: 0, free: true, poly: 3200, sw: 'Blender', lic: 'free',
    dl: 387, views: 2800, rating: 4.4, rc: 52, feat: false,
    img1: 'https://176-108-255-28.sslip.io/api/media/previews/grass_medium_01.png',
    modelUrl: 'https://176-108-255-28.sslip.io/api/media/models/grass_medium_01.fbx',
    modelExt: 'fbx',
    tags: ['low-poly', 'game-ready', 'realtime', 'textures-included'],
  },
  // ── Tech / Electronics ───────────────────────────────────
  {
    cat: 'tech', author: 1,
    title: 'Electric Stove',
    desc: 'Современная электрическая плита с 4 конфорками. Высокодетализированная кухонная техника.',
    price: 1400, free: false, poly: 34000, sw: 'Blender', lic: 'standard',
    dl: 39, views: 510, rating: 4.4, rc: 11, feat: false,
    img1: 'https://176-108-255-28.sslip.io/api/media/previews/electric_stove.png',
    modelUrl: 'https://176-108-255-28.sslip.io/api/media/models/electric_stove.fbx',
    modelExt: 'fbx',
    tags: ['pbr', 'textures-included', 'realistic'],
  },
  // ── Interior / Lighting ──────────────────────────────────
  {
    cat: 'interior', author: 2,
    title: 'Lantern 01',
    desc: 'Антикварный металлический фонарь со стеклянными панелями. Подходит для исторических сцен.',
    price: 800, free: false, poly: 8200, sw: 'Blender', lic: 'standard',
    dl: 201, views: 1560, rating: 4.7, rc: 38, feat: false,
    img1: 'https://176-108-255-28.sslip.io/api/media/previews/Lantern_01.png',
    modelUrl: 'https://176-108-255-28.sslip.io/api/media/models/Lantern_01.fbx',
    modelExt: 'fbx',
    tags: ['pbr', 'textures-included', 'fantasy'],
  },
  // ── Nature / Trees ───────────────────────────────────────
  {
    cat: 'nature', author: 2,
    title: 'Jacaranda Tree',
    desc: 'Пышная жакаранда с яркими фиолетовыми цветами. Идеально для тропических сцен.',
    price: 1600, free: false, poly: 28000, sw: 'Blender', lic: 'standard',
    dl: 57, views: 740, rating: 4.5, rc: 16, feat: true,
    img1: 'https://176-108-255-28.sslip.io/api/media/previews/jacaranda_tree.png',
    modelUrl: 'https://176-108-255-28.sslip.io/api/media/models/jacaranda_tree.fbx',
    modelExt: 'fbx',
    tags: ['pbr', 'textures-included', 'realistic'],
  },
  // ── Interior / Furniture ─────────────────────────────────
  {
    cat: 'interior', author: 1,
    title: 'Gothic Bed 01',
    desc: 'Кровать в готическом стиле с деревянным балдахином и богатой резьбой.',
    price: 3100, free: false, poly: 95000, sw: 'Blender', lic: 'standard',
    dl: 28, views: 490, rating: 4.8, rc: 9, feat: true,
    img1: 'https://176-108-255-28.sslip.io/api/media/previews/GothicBed_01.png',
    modelUrl: 'https://176-108-255-28.sslip.io/api/media/models/GothicBed_01.fbx',
    modelExt: 'fbx',
    tags: ['high-poly', 'pbr', 'textures-included', 'realistic'],
  },
  // ── Interior / Chandelier ────────────────────────────────
  {
    cat: 'interior', author: 2,
    title: 'Chandelier 02',
    desc: 'Элегантная люстра с хрустальными подвесками. Металлический каркас с позолотой.',
    price: 900, free: false, poly: 22000, sw: 'Blender', lic: 'standard',
    dl: 118, views: 1430, rating: 4.6, rc: 27, feat: false,
    img1: 'https://176-108-255-28.sslip.io/api/media/previews/Chandelier_02.png',
    modelUrl: 'https://176-108-255-28.sslip.io/api/media/models/Chandelier_02.fbx',
    modelExt: 'fbx',
    tags: ['pbr', 'textures-included', 'realistic'],
  },
  // ── Food ─────────────────────────────────────────────────
  {
    cat: 'food', author: 2,
    title: 'Asian Pears',
    desc: 'Фотореалистичные азиатские груши с детализированной кожурой.',
    price: 0, free: true, poly: 18000, sw: 'Blender', lic: 'free',
    dl: 445, views: 3200, rating: 4.5, rc: 58, feat: false,
    img1: 'https://176-108-255-28.sslip.io/api/media/previews/food_pears_asian_01.png',
    modelUrl: 'https://176-108-255-28.sslip.io/api/media/models/food_pears_asian_01.fbx',
    modelExt: 'fbx',
    tags: ['pbr', 'textures-included', 'realistic'],
  },
  // ── Abstract / Decorative ────────────────────────────────
  {
    cat: 'abstract', author: 1,
    title: 'Lambis Shell',
    desc: 'Детализированная раковина ламбиса с органической формой. Идеально для морских сцен.',
    price: 650, free: false, poly: 12000, sw: 'Blender', lic: 'standard',
    dl: 88, views: 720, rating: 4.3, rc: 17, feat: false,
    img1: 'https://176-108-255-28.sslip.io/api/media/previews/lambis_shell.png',
    modelUrl: 'https://176-108-255-28.sslip.io/api/media/models/lambis_shell.fbx',
    modelExt: 'fbx',
    tags: ['pbr', 'textures-included'],
  },
  // ── Interior / Nightstand ────────────────────────────────
  {
    cat: 'interior', author: 2,
    title: 'Classic Nightstand 01',
    desc: 'Классическая прикроватная тумбочка в викторианском стиле с выдвижными ящиками.',
    price: 1200, free: false, poly: 15000, sw: 'Blender', lic: 'standard',
    dl: 156, views: 2100, rating: 4.6, rc: 43, feat: false,
    img1: 'https://176-108-255-28.sslip.io/api/media/previews/ClassicNightstand_01.png',
    modelUrl: 'https://176-108-255-28.sslip.io/api/media/models/ClassicNightstand_01.fbx',
    modelExt: 'fbx',
    tags: ['pbr', 'textures-included', 'realistic'],
  },
  // ── Tech / Tools ─────────────────────────────────────────
  {
    cat: 'tech', author: 1,
    title: 'Hand Plane No4',
    desc: 'Старинный столярный рубанок №4. Металлический корпус с деревянной ручкой, детали крепления.',
    price: 1800, free: false, poly: 24000, sw: 'Blender', lic: 'standard',
    dl: 134, views: 1900, rating: 4.8, rc: 32, feat: false,
    img1: 'https://176-108-255-28.sslip.io/api/media/previews/hand_plane_no4.png',
    modelUrl: 'https://176-108-255-28.sslip.io/api/media/models/hand_plane_no4.fbx',
    modelExt: 'fbx',
    tags: ['pbr', 'textures-included', 'realistic'],
  },
  // ── Interior / Chandelier 2 ──────────────────────────────
  {
    cat: 'interior', author: 2,
    title: 'Chandelier 03',
    desc: 'Современная подвесная люстра с LED-лентами. Минималистичный дизайн.',
    price: 2100, free: false, poly: 18000, sw: 'Blender', lic: 'standard',
    dl: 34, views: 480, rating: 4.2, rc: 8, feat: false,
    img1: 'https://176-108-255-28.sslip.io/api/media/previews/Chandelier_03.png',
    modelUrl: 'https://176-108-255-28.sslip.io/api/media/models/Chandelier_03.fbx',
    modelExt: 'fbx',
    tags: ['pbr', 'textures-included', 'realistic'],
  },
  // ── Interior / Table ─────────────────────────────────────
  {
    cat: 'interior', author: 1,
    title: 'Wooden Table 01',
    desc: 'Классический деревянный стол школьного типа. Деревянная столешница на металлических ножках.',
    price: 0, free: true, poly: 8000, sw: 'Blender', lic: 'free',
    dl: 291, views: 2100, rating: 4.7, rc: 37, feat: false,
    img1: 'https://176-108-255-28.sslip.io/api/media/previews/WoodenTable_01.png',
    modelUrl: 'https://176-108-255-28.sslip.io/api/media/models/WoodenTable_01.fbx',
    modelExt: 'fbx',
    tags: ['low-poly', 'game-ready', 'realtime'],
  },
  // ── Transport / Ships ────────────────────────────────────
  {
    cat: 'transport', author: 1,
    title: 'Dutch Ship Large 02',
    desc: 'Большой голландский парусный корабль XVII века. Детализированный такелаж и надводная часть.',
    price: 4500, free: false, poly: 180000, sw: 'Blender', lic: 'extended',
    dl: 63, views: 870, rating: 4.8, rc: 19, feat: true,
    img1: 'https://176-108-255-28.sslip.io/api/media/previews/dutch_ship_large_02.png',
    modelUrl: 'https://176-108-255-28.sslip.io/api/media/models/dutch_ship_large_02.fbx',
    modelExt: 'fbx',
    tags: ['high-poly', 'pbr', 'realistic'],
  },
  // ── Tech / Props ─────────────────────────────────────────
  {
    cat: 'tech', author: 2,
    title: 'Alarm Clock 01',
    desc: 'Классический механический будильник с двумя звонками. Детализированный циферблат и заводной ключ.',
    price: 2600, free: false, poly: 16000, sw: 'Blender', lic: 'standard',
    dl: 45, views: 680, rating: 4.7, rc: 14, feat: false,
    img1: 'https://176-108-255-28.sslip.io/api/media/previews/alarm_clock_01.png',
    modelUrl: 'https://176-108-255-28.sslip.io/api/media/models/alarm_clock_01.fbx',
    modelExt: 'fbx',
    tags: ['pbr', 'textures-included', 'realistic'],
  },
  // ── Interior / Console ───────────────────────────────────
  {
    cat: 'interior', author: 1,
    title: 'Classic Console 01',
    desc: 'Классическая консольная тумба в готическом стиле. Дерево с резными деталями.',
    price: 3200, free: false, poly: 42000, sw: 'Blender', lic: 'standard',
    dl: 27, views: 420, rating: 4.5, rc: 9, feat: false,
    img1: 'https://176-108-255-28.sslip.io/api/media/previews/ClassicConsole_01.png',
    modelUrl: 'https://176-108-255-28.sslip.io/api/media/models/ClassicConsole_01.fbx',
    modelExt: 'fbx',
    tags: ['pbr', 'textures-included', 'realistic'],
  },
  // ── Abstract / Industrial ────────────────────────────────
  {
    cat: 'abstract', author: 2,
    title: 'Barrel 01',
    desc: 'Металлическая промышленная бочка. Универсальный реквизит для игровых сцен.',
    price: 0, free: true, poly: 3200, sw: 'Blender', lic: 'free',
    dl: 612, views: 5400, rating: 4.5, rc: 84, feat: false,
    img1: 'https://176-108-255-28.sslip.io/api/media/previews/Barrel_01.png',
    modelUrl: 'https://176-108-255-28.sslip.io/api/media/models/Barrel_01.fbx',
    modelExt: 'fbx',
    tags: ['low-poly', 'game-ready', 'realtime'],
  },
]

async function seed () {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    console.log('🧹 Очищаем старые данные...')
    await client.query(`
      TRUNCATE TABLE support_messages, support_chats, download_tokens, licenses,
        order_items, orders, favorites, cart_items, model_tags, model_files,
        model_images, moderation_queue, reviews, models, refresh_tokens,
        profiles, users
      RESTART IDENTITY CASCADE
    `)

    // ── Пользователи ─────────────────────────────────────
    console.log('👤 Создаём пользователей...')
    const adminId   = uuidv4()
    const a1Id      = uuidv4()
    const a2Id      = uuidv4()
    const b1Id      = uuidv4()
    const b2Id      = uuidv4()

    const users = [
      { id: adminId, email: 'admin@rks.ru',   pw: 'Admin1234',  role: 'admin'  },
      { id: a1Id,    email: 'author1@rks.ru',  pw: 'Author1234', role: 'author' },
      { id: a2Id,    email: 'author2@rks.ru',  pw: 'Author1234', role: 'author' },
      { id: b1Id,    email: 'buyer1@rks.ru',   pw: 'Buyer1234',  role: 'buyer'  },
      { id: b2Id,    email: 'buyer2@rks.ru',   pw: 'Buyer1234',  role: 'buyer'  },
    ]
    for (const u of users) {
      const hash = await bcrypt.hash(u.pw, 12)
      await client.query(
        `INSERT INTO users (id, email, password_hash, role, is_active, email_verified)
         VALUES ($1,$2,$3,$4,TRUE,TRUE)`,
        [u.id, u.email, hash, u.role]
      )
    }

    const profiles = [
      { id: adminId, first: 'Руслан',    last: 'Абрамов',   display: 'Admin RKS',       bio: 'Администратор платформы РКС 3D Маркетплейс' },
      { id: a1Id,    first: 'Иван',      last: 'Петров',    display: 'IvanPetrov3D',    bio: '3D-художник с 7 годами опыта. Специализируюсь на архитектурной визуализации и транспорте.' },
      { id: a2Id,    first: 'Мария',     last: 'Сидорова',  display: 'MariaSid',        bio: 'Character & environment artist. Создаю персонажей и природные сцены для игр.' },
      { id: b1Id,    first: 'Алексей',   last: 'Иванов',    display: 'AlexIv',          bio: null },
      { id: b2Id,    first: 'Екатерина', last: 'Козлова',   display: 'KateK',           bio: null },
    ]
    for (const p of profiles) {
      await client.query(
        `INSERT INTO profiles (id, first_name, last_name, display_name, bio)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (id) DO UPDATE SET first_name=$2, last_name=$3, display_name=$4, bio=$5`,
        [p.id, p.first, p.last, p.display, p.bio]
      )
    }

    // ── Категории и теги ──────────────────────────────────
    console.log('📂 Загружаем справочники...')
    const catRes = await client.query('SELECT id, slug FROM categories')
    const catMap = Object.fromEntries(catRes.rows.map(r => [r.slug, r.id]))

    const tagRes = await client.query('SELECT id, slug FROM tags')
    const tagMap = Object.fromEntries(tagRes.rows.map(r => [r.slug, r.id]))

    const authorIds = [null, a1Id, a2Id]

    // ── Модели ────────────────────────────────────────────
    console.log(`📦 Создаём ${MODELS.length} моделей...`)
    const insertedModels = []

    for (const m of MODELS) {
      const id = uuidv4()
      const authorId = authorIds[m.author]

      await client.query(
        `INSERT INTO models
          (id, author_id, category_id, title, description, price, is_free,
           status, polygon_count, software_used, license_type,
           preview_image_url, thumbnail_url,
           download_count, view_count, rating_avg, rating_count, is_featured)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'published',$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
        [
          id, authorId, catMap[m.cat] || null,
          m.title, m.desc, m.price, m.free,
          m.poly, m.sw, m.lic,
          m.img1, m.img1,
          m.dl, m.views, m.rating, m.rc, m.feat || false,
        ]
      )

      // Изображения
      await client.query(
        `INSERT INTO model_images (model_id, image_url, is_primary, sort_order) VALUES ($1,$2,TRUE,0)`,
        [id, m.img1]
      )

      // Файл
      const fileExt = m.modelExt || 'fbx'
      await client.query(
        `INSERT INTO model_files (model_id, file_name, file_path, file_format, file_size_bytes, is_primary)
         VALUES ($1,$2,$3,$4,$5,TRUE)`,
        [
          id,
          `${m.title.replace(/\s+/g, '_')}.${fileExt}`,
          m.modelUrl || `/models/${id}/main.${fileExt}`,
          fileExt.toUpperCase(),
          (Math.floor(Math.random() * 80) + 10) * 1024 * 1024,
        ]
      )

      // Теги
      for (const slug of (m.tags || [])) {
        if (tagMap[slug]) {
          await client.query(
            `INSERT INTO model_tags (model_id, tag_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
            [id, tagMap[slug]]
          )
        }
      }

      insertedModels.push({ id, ...m, authorId })
    }

    // ── Отзывы ────────────────────────────────────────────
    console.log('⭐ Добавляем отзывы...')
    const reviewsRaw = [
      // Painted Wooden Chair 02 (idx 0)
      [0,  b1Id, 5, 'Отличная модель! Текстуры высокого качества, сразу подошла для моего проекта интерьера. Рекомендую всем, кто делает винтажные сцены.'],
      [0,  b2Id, 4, 'Хорошая работа. Немного не хватает вариантов цвета краски, но в целом очень доволен. Детализация на уровне.'],
      // Fir Sapling Medium (idx 1)
      [1,  b2Id, 5, 'Идеальная молодая ель для лесных сцен! Хвоя выглядит реалистично, оптимизация отличная. Использую в нескольких проектах.'],
      [1,  b1Id, 4, 'Очень приятная модель, но хотелось бы больше вариантов размера. Сам меш чистый, текстуры в порядке.'],
      // Large Castle Door (idx 3)
      [3,  b1Id, 5, 'Потрясающие ворота! Детализация металлических петель и окования просто великолепна. Использовал в RPG-проекте — все в восторге.'],
      [3,  b2Id, 5, 'Купил для исторической визуализации — лучшее решение. Геометрия идеальна, текстуры 4K работают из коробки.'],
      // Electric Stove (idx 5)
      [5,  b1Id, 5, 'Электрическая плита отлично детализирована. Сэкономил кучу времени на кухонной сцене. Конфорки выглядят реалистично.'],
      [5,  b2Id, 4, 'Хорошая модель для архвиза. Немного хотелось бы видеть открывающуюся дверцу духовки, но текстуры просто огонь.'],
      // Jacaranda Tree (idx 7)
      [7,  b2Id, 5, 'Дерево просто идеально! Фиолетовые цветы выглядят потрясающе в рендере. Детализация невероятная, материалы работают из коробки.'],
      [7,  b1Id, 5, 'Лучшее тропическое дерево на платформе. Купил для рекламного ролика — клиент в восторге. Советую всем.'],
      // Gothic Bed 01 (idx 8)
      [8,  b1Id, 5, 'Готическая кровать отлично вписалась в мой проект! Резьба по дереву выглядит фотореалистично. Покупка однозначно оправдана.'],
      [8,  b2Id, 4, 'Отличная кровать, очень детальная. Хотелось бы получить вариант без балдахина, но в целом работа на пятёрку.'],
      // Chandelier 02 (idx 9)
      [9,  b2Id, 5, 'Люстра просто шедевр! Хрустальные подвески в рендере выглядят невероятно. Использую в архитектурных презентациях.'],
      [9,  b1Id, 4, 'Красивая люстра, качество геометрии высокое. Хотелось бы больше вариантов размера, но для моих задач подошло идеально.'],
      // Asian Pears (idx 10)
      [10, b2Id, 5, 'Груши выглядят фотореалистично. Купил для рекламного ролика продуктов питания — клиент остался очень доволен.'],
      [10, b1Id, 5, 'Отличная еда-модель! Кожура, блики — всё настоящее. Быстро вписал в сцену, ни одной правки делать не пришлось.'],
      // Lambis Shell (idx 11)
      [11, b1Id, 5, 'Раковина выглядит потрясающе в морской сцене! Органическая форма передана идеально, материалы перламутра работают отлично.'],
      [11, b2Id, 4, 'Качественная работа. Использовал в подводной сцене — смотрится очень натурально. Единственное пожелание — добавить больше ракурсов в превью.'],
      // Dutch Ship Large 02 (idx 16)
      [16, b1Id, 5, 'Лучший парусник на платформе! Такелаж детализирован до последней верёвки. Использую в исторической игре — выглядит эпически.'],
      [16, b2Id, 5, 'Невероятная работа. Корабль XVII века воссоздан с исторической точностью. Сразу купил и ни разу не пожалел.'],
      // Alarm Clock 01 (idx 17)
      [17, b2Id, 5, 'Будильник выглядит как настоящий антиквариат. Детали циферблата и звонков проработаны до мелочей. Отлично для ностальгических сцен.'],
      [17, b1Id, 4, 'Хорошая модель, текстуры приятные. Немного не хватает анимации стрелок, но как статичный реквизит — идеально.'],
      // Barrel 01 (idx 19)
      [19, b1Id, 5, 'Бочка — must-have для любой игровой сцены! Оптимизирована идеально, текстуры металла реалистичны. Взял сразу несколько штук.'],
      [19, b2Id, 5, 'Простая, но очень качественная модель. Использую как реквизит в индустриальных сценах. Всем рекомендую!'],
    ]
    for (const [idx, uid, rating, comment] of reviewsRaw) {
      if (insertedModels[idx]) {
        await client.query(
          `INSERT INTO reviews (model_id, user_id, rating, comment)
           VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
          [insertedModels[idx].id, uid, rating, comment]
        )
      }
    }

    // ── Заказы ────────────────────────────────────────────
    console.log('🛒 Создаём заказы...')
    const paid = insertedModels.filter(m => !m.free)

    const makeOrder = async (userId, orderNum, status, items) => {
      const orderId = uuidv4()
      const total   = items.reduce((s, m) => s + m.price, 0)
      await client.query(
        `INSERT INTO orders (id, user_id, order_number, status, total_amount, payment_method)
         VALUES ($1,$2,$3,$4,$5,'card')`,
        [orderId, userId, orderNum, status, total]
      )
      for (const m of items) {
        const oiId = uuidv4()
        await client.query(
          `INSERT INTO order_items (id, order_id, model_id, model_title, model_preview_url, author_id, price, license_type)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [oiId, orderId, m.id, m.title, m.img1, m.authorId, m.price, m.lic]
        )
        await client.query(
          `INSERT INTO licenses (order_item_id, user_id, model_id, license_key, license_type)
           VALUES ($1,$2,$3,$4,$5)`,
          [oiId, userId, m.id, `LIC-${uuidv4().slice(0,8).toUpperCase()}`, m.lic]
        )
      }
    }

    await makeOrder(b1Id, 'ORD-2024-0001', 'completed', [paid[0], paid[4], paid[7]])
    await makeOrder(b2Id, 'ORD-2024-0002', 'completed', [paid[5], paid[8]])
    await makeOrder(b1Id, 'ORD-2024-0003', 'paid',      [paid[1], paid[2]])
    await makeOrder(b2Id, 'ORD-2024-0004', 'paid',      [paid[3], paid[6]])

    // ── Избранное ─────────────────────────────────────────
    console.log('❤️  Добавляем избранное...')
    const favs = [
      [b1Id, 5], [b1Id, 1], [b1Id, 10], [b1Id, 22],
      [b2Id, 2], [b2Id, 8], [b2Id, 18], [b2Id, 6],
    ]
    for (const [uid, idx] of favs) {
      if (insertedModels[idx]) {
        await client.query(
          `INSERT INTO favorites (user_id, model_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [uid, insertedModels[idx].id]
        )
      }
    }

    // ── Корзина ───────────────────────────────────────────
    const cartItems = [
      [b1Id, 15], [b1Id, 19],
      [b2Id, 11], [b2Id, 20],
    ]
    for (const [uid, idx] of cartItems) {
      if (insertedModels[idx]) {
        await client.query(
          `INSERT INTO cart_items (user_id, model_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [uid, insertedModels[idx].id]
        )
      }
    }

    await client.query('COMMIT')

    console.log('')
    console.log('✅ База данных успешно заполнена!')
    console.log('')
    console.log('👥 Пользователи:')
    console.log('   admin@rks.ru    / Admin1234')
    console.log('   author1@rks.ru  / Author1234')
    console.log('   author2@rks.ru  / Author1234')
    console.log('   buyer1@rks.ru   / Buyer1234')
    console.log('   buyer2@rks.ru   / Buyer1234')
    console.log('')
    console.log(`📦 Моделей: ${MODELS.length} (все опубликованы)`)
    console.log('🛒 Заказов: 4')
    console.log('⭐ Отзывов: 11')
    console.log('❤️  Избранное: 8 записей')

  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Ошибка:', err.message)
    console.error(err)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
