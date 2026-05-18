/**
 * Seed: тестовые данные для дипломного проекта РКС 3D Маркетплейс
 * Запуск на ВМ: node database/seed.cjs
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

// Реальные фотографии через picsum (стабильный CDN, seed = всегда одна картинка)
const img = (seed, w = 600, h = 400) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`

// Модели — 28 штук по всем категориям
const MODELS = [
  // ── Архитектура ──────────────────────────────────────────
  {
    cat: 'architecture', author: 1,
    title: 'Современный жилой дом',
    desc: 'Детализированная модель современного многоквартирного дома. Включает PBR-текстуры, лопасти жалюзи, балконные ограждения. Готова к рендеру в Blender и 3ds Max.',
    price: 1500, free: false, poly: 85000, sw: 'Blender', lic: 'standard',
    dl: 42, views: 310, rating: 4.7, rc: 12, feat: true,
    img1: img('arch1'), img2: img('arch1b', 600, 400),
    tags: ['pbr', 'textures-included', 'realistic'],
  },
  {
    cat: 'architecture', author: 1,
    title: 'Средневековый замок',
    desc: 'Детализированный замок с башнями, рвом и подъёмным мостом. Отличная основа для RPG и исторических визуализаций.',
    price: 2800, free: false, poly: 210000, sw: 'Blender', lic: 'extended',
    dl: 18, views: 195, rating: 4.9, rc: 7, feat: true,
    img1: img('castle1'), img2: img('castle2'),
    tags: ['high-poly', 'textures-included', 'fantasy'],
  },
  {
    cat: 'architecture', author: 2,
    title: 'Японский храм',
    desc: 'Традиционный синтоистский храм с тории, каменными фонарями и садом камней. Полный набор PBR-материалов.',
    price: 3400, free: false, poly: 145000, sw: 'Blender', lic: 'extended',
    dl: 31, views: 540, rating: 4.8, rc: 15, feat: true,
    img1: img('temple1'), img2: img('temple2'),
    tags: ['high-poly', 'pbr', 'realistic', 'textures-included'],
  },
  {
    cat: 'architecture', author: 1,
    title: 'Минималистичный коттедж',
    desc: 'Одноэтажный дом в стиле современного минимализма. Low-poly, оптимизирован для игровых движков.',
    price: 0, free: true, poly: 14000, sw: 'Blender', lic: 'free',
    dl: 387, views: 2800, rating: 4.4, rc: 52, feat: false,
    img1: img('house1'), img2: img('house2'),
    tags: ['low-poly', 'game-ready', 'realtime'],
  },
  {
    cat: 'architecture', author: 2,
    title: 'Небоскрёб бизнес-центр',
    desc: '40-этажный стеклянный небоскрёб с детализированным лобби и паркингом. Подходит для архитектурных презентаций.',
    price: 5200, free: false, poly: 290000, sw: '3ds Max', lic: 'extended',
    dl: 9, views: 210, rating: 4.6, rc: 4, feat: false,
    img1: img('skyscraper1'), img2: img('skyscraper2'),
    tags: ['high-poly', 'pbr', 'realistic'],
  },

  // ── Персонажи ────────────────────────────────────────────
  {
    cat: 'characters', author: 2,
    title: 'Рыцарь в доспехах',
    desc: 'Полностью зариггированный рыцарь с анимациями ходьбы, атаки и смерти. Готов к Unreal Engine 5 и Unity.',
    price: 3800, free: false, poly: 68000, sw: 'Maya', lic: 'standard',
    dl: 89, views: 1240, rating: 4.9, rc: 24, feat: true,
    img1: img('knight1'), img2: img('knight2'),
    tags: ['rigged', 'animated', 'game-ready', 'pbr'],
  },
  {
    cat: 'characters', author: 2,
    title: 'Мультяшный котёнок',
    desc: 'Милый мультяшный персонаж для детских игр. 5 базовых анимаций: бег, прыжок, сидение, сон, победа.',
    price: 1200, free: false, poly: 8500, sw: 'Blender', lic: 'standard',
    dl: 156, views: 2100, rating: 4.6, rc: 43, feat: false,
    img1: img('cat1'), img2: img('cat2'),
    tags: ['rigged', 'animated', 'cartoon', 'game-ready'],
  },
  {
    cat: 'characters', author: 2,
    title: 'Научный работник (NPC)',
    desc: 'Персонаж учёного в белом халате. Риггинг совместим с Mixamo, 12 готовых анимаций в комплекте.',
    price: 2100, free: false, poly: 42000, sw: 'Maya', lic: 'standard',
    dl: 34, views: 480, rating: 4.2, rc: 8, feat: false,
    img1: img('scientist1'), img2: img('scientist2'),
    tags: ['rigged', 'game-ready', 'realistic'],
  },
  {
    cat: 'characters', author: 1,
    title: 'Солдат спецназа',
    desc: 'Высокодетализированный боец SWAT с полным снаряжением. Тактический жилет, шлем, оружие — всё отдельными мешами.',
    price: 4200, free: false, poly: 95000, sw: 'Maya', lic: 'extended',
    dl: 61, views: 980, rating: 4.8, rc: 18, feat: true,
    img1: img('soldier1'), img2: img('soldier2'),
    tags: ['rigged', 'animated', 'pbr', 'game-ready', 'realistic'],
  },
  {
    cat: 'characters', author: 2,
    title: 'Базовый женский персонаж',
    desc: 'Универсальная женская base mesh с корректными пропорциями. Идеальна как основа для собственных персонажей.',
    price: 0, free: true, poly: 22000, sw: 'Blender', lic: 'free',
    dl: 612, views: 5400, rating: 4.5, rc: 84, feat: false,
    img1: img('female1'), img2: img('female2'),
    tags: ['rigged', 'realistic'],
  },

  // ── Транспорт ────────────────────────────────────────────
  {
    cat: 'transport', author: 1,
    title: 'Спортивный автомобиль 2024',
    desc: 'Высокодетализированный спорткар. Открываются двери, капот, багажник. PBR-текстуры 4K, настраиваемый цвет кузова.',
    price: 4500, free: false, poly: 320000, sw: '3ds Max', lic: 'extended',
    dl: 63, views: 870, rating: 4.8, rc: 19, feat: true,
    img1: img('car1'), img2: img('car2'),
    tags: ['high-poly', 'pbr', 'realistic'],
  },
  {
    cat: 'transport', author: 1,
    title: 'Военный вертолёт',
    desc: 'Ударный вертолёт с вращающимися лопастями. Готов к анимации и игровым сценам. Включает LOD-версию.',
    price: 3600, free: false, poly: 180000, sw: '3ds Max', lic: 'standard',
    dl: 27, views: 440, rating: 4.6, rc: 11, feat: false,
    img1: img('helicopter1'), img2: img('helicopter2'),
    tags: ['animated', 'pbr', 'game-ready'],
  },
  {
    cat: 'transport', author: 2,
    title: 'Городской автобус',
    desc: 'Современный городской автобус с интерьером. Открываются двери, складываются пандусы. Отличный выбор для городских симуляторов.',
    price: 2200, free: false, poly: 95000, sw: 'Blender', lic: 'standard',
    dl: 44, views: 620, rating: 4.3, rc: 13, feat: false,
    img1: img('bus1'), img2: img('bus2'),
    tags: ['animated', 'pbr', 'realistic'],
  },
  {
    cat: 'transport', author: 1,
    title: 'Мотоцикл-чоппер',
    desc: 'Классический чоппер в стиле 70-х. Хромированные детали, кожаное сиденье, кастомные выхлопные трубы.',
    price: 0, free: true, poly: 38000, sw: 'Blender', lic: 'free',
    dl: 291, views: 2100, rating: 4.7, rc: 37, feat: false,
    img1: img('moto1'), img2: img('moto2'),
    tags: ['pbr', 'textures-included', 'realistic'],
  },

  // ── Природа ──────────────────────────────────────────────
  {
    cat: 'nature', author: 2,
    title: 'Пак тропических деревьев',
    desc: '15 уникальных тропических деревьев с wind-анимацией. Оптимизировано для реального времени, Billboard LOD в комплекте.',
    price: 0, free: true, poly: 4200, sw: 'Blender', lic: 'free',
    dl: 512, views: 4300, rating: 4.4, rc: 67, feat: false,
    img1: img('trees1'), img2: img('trees2'),
    tags: ['low-poly', 'game-ready', 'realtime', 'textures-included'],
  },
  {
    cat: 'nature', author: 2,
    title: 'Скалистый горный ландшафт',
    desc: 'Детализированный горный рельеф 2×2 км. Включает снег, камни, траву и шейдер смешивания текстур.',
    price: 2800, free: false, poly: 65000, sw: 'Blender', lic: 'standard',
    dl: 33, views: 560, rating: 4.7, rc: 14, feat: false,
    img1: img('mountain1'), img2: img('mountain2'),
    tags: ['pbr', 'textures-included', 'realistic'],
  },
  {
    cat: 'nature', author: 1,
    title: 'Морские кораллы и водоросли',
    desc: 'Набор из 20 коралловых элементов и 8 видов водорослей. Идеально для подводных сцен. Прозрачные шейдеры включены.',
    price: 1600, free: false, poly: 28000, sw: 'Blender', lic: 'standard',
    dl: 57, views: 740, rating: 4.5, rc: 16, feat: false,
    img1: img('coral1'), img2: img('coral2'),
    tags: ['pbr', 'textures-included', 'realtime'],
  },

  // ── Интерьер ─────────────────────────────────────────────
  {
    cat: 'interior', author: 1,
    title: 'Скандинавский диван',
    desc: 'Минималистичный диван в скандинавском стиле. 6 вариантов цвета ткани, съёмные подушки отдельными объектами.',
    price: 0, free: true, poly: 12000, sw: 'Blender', lic: 'free',
    dl: 234, views: 1820, rating: 4.3, rc: 31, feat: false,
    img1: img('sofa1'), img2: img('sofa2'),
    tags: ['low-poly', 'textures-included', 'realtime'],
  },
  {
    cat: 'interior', author: 2,
    title: 'Полный набор кухни',
    desc: 'Фотореалистичный кухонный гарнитур: шкафы, столешница, встроенная техника, посуда. 47 отдельных объектов.',
    price: 3100, free: false, poly: 120000, sw: 'Blender', lic: 'standard',
    dl: 28, views: 490, rating: 4.8, rc: 9, feat: true,
    img1: img('kitchen1'), img2: img('kitchen2'),
    tags: ['high-poly', 'pbr', 'textures-included', 'realistic'],
  },
  {
    cat: 'interior', author: 1,
    title: 'Офисный стол геймера',
    desc: 'Игровая рабочая станция с подсветкой RGB. Монитор, клавиатура, мышь, наушники — всё в комплекте с PBR-материалами.',
    price: 900, free: false, poly: 34000, sw: 'Blender', lic: 'standard',
    dl: 118, views: 1430, rating: 4.6, rc: 27, feat: false,
    img1: img('desk1'), img2: img('desk2'),
    tags: ['pbr', 'textures-included', 'realtime', 'game-ready'],
  },

  // ── Техника ──────────────────────────────────────────────
  {
    cat: 'tech', author: 1,
    title: 'Промышленный робот',
    desc: 'Роботизированная рука для производственной линии. Полный риггинг, 6 степеней свободы, базовые анимации захвата.',
    price: 3200, free: false, poly: 45000, sw: '3ds Max', lic: 'standard',
    dl: 27, views: 420, rating: 4.5, rc: 9, feat: false,
    img1: img('robot1'), img2: img('robot2'),
    tags: ['rigged', 'animated', 'pbr'],
  },
  {
    cat: 'tech', author: 2,
    title: 'Боевой дрон',
    desc: 'Квадрокоптер военного класса с вращающимися пропеллерами. Анимация взлёта и зависания. Готов к использованию в играх.',
    price: 2600, free: false, poly: 52000, sw: 'Blender', lic: 'standard',
    dl: 45, views: 680, rating: 4.7, rc: 14, feat: false,
    img1: img('drone1'), img2: img('drone2'),
    tags: ['animated', 'pbr', 'game-ready', 'sci-fi'],
  },
  {
    cat: 'tech', author: 1,
    title: 'Серверная стойка',
    desc: '42U серверная стойка с 12 серверами, кабельной разводкой и патч-панелью. Идеально для sci-fi интерьеров и визуализаций ЦОД.',
    price: 1400, free: false, poly: 67000, sw: '3ds Max', lic: 'standard',
    dl: 39, views: 510, rating: 4.4, rc: 11, feat: false,
    img1: img('server1'), img2: img('server2'),
    tags: ['pbr', 'textures-included', 'sci-fi'],
  },

  // ── Оружие ───────────────────────────────────────────────
  {
    cat: 'weapons', author: 2,
    title: 'Фэнтезийный меч',
    desc: 'Двуручный меч с магическими рунами. PBR-текстуры, emission map для эффекта свечения, 4K разрешение карт.',
    price: 800, free: false, poly: 6400, sw: 'Blender', lic: 'standard',
    dl: 201, views: 1560, rating: 4.7, rc: 38, feat: false,
    img1: img('sword1'), img2: img('sword2'),
    tags: ['pbr', 'textures-included', 'fantasy', 'game-ready'],
  },
  {
    cat: 'weapons', author: 1,
    title: 'Тактический автомат',
    desc: 'Современный штурмовой карабин с съёмными обвесами: прицел, глушитель, фонарь, цевьё. FPS-ready, все детали отдельно.',
    price: 1800, free: false, poly: 48000, sw: '3ds Max', lic: 'extended',
    dl: 134, views: 1900, rating: 4.8, rc: 32, feat: true,
    img1: img('rifle1'), img2: img('rifle2'),
    tags: ['pbr', 'game-ready', 'realistic', 'textures-included'],
  },

  // ── Еда ──────────────────────────────────────────────────
  {
    cat: 'food', author: 2,
    title: 'Пак японской кухни',
    desc: 'Суши, роллы, рамен, темпура — 18 готовых блюд с фотореалистичными текстурами. Идеально для рекламных визуализаций.',
    price: 1200, free: false, poly: 35000, sw: 'Blender', lic: 'standard',
    dl: 76, views: 1100, rating: 4.6, rc: 22, feat: false,
    img1: img('food1'), img2: img('food2'),
    tags: ['pbr', 'textures-included', 'realistic'],
  },
  {
    cat: 'food', author: 1,
    title: 'Пекарня: хлеб и выпечка',
    desc: '24 вида хлеба, булочек и пирогов с детализированной корочкой и мякишью. Процедурные шейдеры в комплекте.',
    price: 0, free: true, poly: 18000, sw: 'Blender', lic: 'free',
    dl: 445, views: 3200, rating: 4.5, rc: 58, feat: false,
    img1: img('bread1'), img2: img('bread2'),
    tags: ['pbr', 'textures-included'],
  },

  // ── Абстракция ───────────────────────────────────────────
  {
    cat: 'abstract', author: 1,
    title: 'Кристаллическая структура',
    desc: 'Абстрактная кристаллическая форма с процедурными материалами. Параметры настраиваются через geometry nodes.',
    price: 650, free: false, poly: 3200, sw: 'Blender', lic: 'standard',
    dl: 88, views: 720, rating: 4.3, rc: 17, feat: false,
    img1: img('crystal1'), img2: img('crystal2'),
    tags: ['pbr'],
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
          m.img1, img(m.img1.split('/').pop(), 300, 200),
          m.dl, m.views, m.rating, m.rc, m.feat || false,
        ]
      )

      // Изображения
      await client.query(
        `INSERT INTO model_images (model_id, image_url, is_primary, sort_order) VALUES ($1,$2,TRUE,0)`,
        [id, m.img1]
      )
      await client.query(
        `INSERT INTO model_images (model_id, image_url, is_primary, sort_order) VALUES ($1,$2,FALSE,1)`,
        [id, m.img2]
      )

      // Файл
      const ext = m.sw === '3ds Max' ? 'max' : m.sw === 'Maya' ? 'ma' : 'blend'
      await client.query(
        `INSERT INTO model_files (model_id, file_name, file_path, file_format, file_size_bytes, is_primary)
         VALUES ($1,$2,$3,$4,$5,TRUE)`,
        [
          id,
          `${m.title.replace(/\s+/g, '_')}.${ext}`,
          `/models/${id}/main.${ext}`,
          ext === 'blend' ? 'BLEND' : ext === 'max' ? 'MAX' : 'MAYA',
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
      [0,  b1Id, 5, 'Отличная модель! Очень детализированная, текстуры высокого качества. Сразу подошла для моего проекта.'],
      [0,  b2Id, 4, 'Хорошая работа, но хотелось бы больше вариантов фасадов. В целом доволен покупкой.'],
      [1,  b1Id, 5, 'Потрясающий замок! Работа заслуживает наивысшей оценки. Куплю ещё модели автора.'],
      [2,  b2Id, 5, 'Японский храм просто идеален. Детализация невероятная, материалы работают из коробки.'],
      [5,  b1Id, 5, 'Идеальный рыцарь для моего проекта, все анимации плавные и качественные.'],
      [6,  b2Id, 4, 'Котёнок просто прелесть 😊 Анимации плавные, рекомендую!'],
      [8,  b1Id, 5, 'Лучший персонаж-солдат что я видел. Купил сразу — не пожалел.'],
      [10, b2Id, 5, 'Лучший автомобиль на платформе. Детали просто потрясающие, 4K текстуры огонь.'],
      [18, b1Id, 5, 'Набор кухни очень детализирован. Сэкономил кучу времени на проекте.'],
      [23, b2Id, 5, 'Тактический автомат — лучшая покупка этого месяца. FPS-проект выглядит профессионально.'],
      [22, b1Id, 5, 'Меч с рунами выглядит потрясающе в игре. Эффект свечения настроен идеально.'],
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
