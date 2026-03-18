/**
 * Скрипт заполнения БД тестовыми данными
 * Запуск: node database/seed.js
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
const { Pool } = require(nm + '/pg')
const bcrypt = require(nm + '/bcryptjs')
const { v4: uuidv4 } = require(nm + '/uuid')

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'rks_3d_marketplace',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
})

const PLACEHOLDER_IMAGE = 'https://placehold.co/600x400/2563eb/ffffff?text=3D+Model'
const PLACEHOLDER_THUMB = 'https://placehold.co/300x200/2563eb/ffffff?text=3D'

async function seed() {
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

    // ──────────────────────────────────────────────
    // ПОЛЬЗОВАТЕЛИ
    // ──────────────────────────────────────────────
    console.log('👤 Создаём пользователей...')

    const adminId    = uuidv4()
    const author1Id  = uuidv4()
    const author2Id  = uuidv4()
    const buyer1Id   = uuidv4()
    const buyer2Id   = uuidv4()

    const users = [
      { id: adminId,   email: 'admin@rks.ru',   password: 'Admin1234',  role: 'admin'  },
      { id: author1Id, email: 'author1@rks.ru',  password: 'Author1234', role: 'author' },
      { id: author2Id, email: 'author2@rks.ru',  password: 'Author1234', role: 'author' },
      { id: buyer1Id,  email: 'buyer1@rks.ru',   password: 'Buyer1234',  role: 'buyer'  },
      { id: buyer2Id,  email: 'buyer2@rks.ru',   password: 'Buyer1234',  role: 'buyer'  },
    ]

    for (const u of users) {
      const hash = await bcrypt.hash(u.password, 12)
      await client.query(
        `INSERT INTO users (id, email, password_hash, role, is_active, email_verified)
         VALUES ($1, $2, $3, $4, TRUE, TRUE)`,
        [u.id, u.email, hash, u.role]
      )
    }

    // Профили
    const profiles = [
      { id: adminId,   first: 'Руслан',   last: 'Администратов', display: 'Admin',           bio: 'Администратор платформы' },
      { id: author1Id, first: 'Иван',     last: 'Петров',        display: 'IvanPetrov3D',     bio: '3D-художник с 7 годами опыта. Специализируюсь на архитектурной визуализации.' },
      { id: author2Id, first: 'Мария',    last: 'Сидорова',      display: 'MariaSid',         bio: 'Character artist, люблю создавать персонажей для игр и кино.' },
      { id: buyer1Id,  first: 'Алексей',  last: 'Иванов',        display: 'AlexIv',           bio: null },
      { id: buyer2Id,  first: 'Екатерина',last: 'Козлова',       display: 'KateK',            bio: null },
    ]

    for (const p of profiles) {
      await client.query(
        `INSERT INTO profiles (id, first_name, last_name, display_name, bio)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET first_name=$2, last_name=$3, display_name=$4, bio=$5`,
        [p.id, p.first, p.last, p.display, p.bio]
      )
    }

    // ──────────────────────────────────────────────
    // КАТЕГОРИИ (уже есть в schema.sql, но добавим ON CONFLICT)
    // ──────────────────────────────────────────────
    console.log('📂 Проверяем категории...')
    const catRes = await client.query('SELECT id, slug FROM categories')
    const catMap = {}
    for (const r of catRes.rows) catMap[r.slug] = r.id

    const tagRes = await client.query('SELECT id, slug FROM tags')
    const tagMap = {}
    for (const r of tagRes.rows) tagMap[r.slug] = r.id

    // ──────────────────────────────────────────────
    // 3D МОДЕЛИ
    // ──────────────────────────────────────────────
    console.log('📦 Создаём 3D-модели...')

    const modelsData = [
      // author1 — архитектура, техника
      {
        id: uuidv4(), authorId: author1Id, category: 'architecture',
        title: 'Современный жилой дом',
        description: 'Детализированная модель современного многоквартирного дома. Включает текстуры PBR, готова к рендеру в Blender и 3ds Max.',
        price: 1500, isFree: false, status: 'published', polygons: 85000,
        software: 'Blender', license: 'standard', downloads: 42, views: 310, rating: 4.7, ratingCount: 12,
        tags: ['pbr', 'textures-included', 'realistic'], isFeatured: true,
      },
      {
        id: uuidv4(), authorId: author1Id, category: 'architecture',
        title: 'Средневековый замок',
        description: 'Детализированный средневековый замок с башнями, рвом и подъёмным мостом. Отлично подходит для игр и визуализации.',
        price: 2800, isFree: false, status: 'published', polygons: 210000,
        software: 'Blender', license: 'extended', downloads: 18, views: 195, rating: 4.9, ratingCount: 7,
        tags: ['high-poly', 'textures-included', 'fantasy'], isFeatured: true,
      },
      {
        id: uuidv4(), authorId: author1Id, category: 'tech',
        title: 'Промышленный робот',
        description: 'Роботизированная рука для производственной линии. Включает риггинг и базовые анимации захвата.',
        price: 3200, isFree: false, status: 'published', polygons: 45000,
        software: '3ds Max', license: 'standard', downloads: 27, views: 420, rating: 4.5, ratingCount: 9,
        tags: ['rigged', 'animated', 'pbr'], isFeatured: false,
      },
      {
        id: uuidv4(), authorId: author1Id, category: 'interior',
        title: 'Скандинавский диван',
        description: 'Минималистичный диван в скандинавском стиле. Несколько вариантов цвета ткани в комплекте.',
        price: 0, isFree: true, status: 'published', polygons: 12000,
        software: 'Blender', license: 'free', downloads: 234, views: 1820, rating: 4.3, ratingCount: 31,
        tags: ['low-poly', 'textures-included', 'realtime'], isFeatured: false,
      },
      {
        id: uuidv4(), authorId: author1Id, category: 'transport',
        title: 'Спортивный автомобиль 2024',
        description: 'Высокодетализированная модель спорткара. Открываются двери, капот, багажник. PBR текстуры 4K.',
        price: 4500, isFree: false, status: 'published', polygons: 320000,
        software: '3ds Max', license: 'extended', downloads: 63, views: 870, rating: 4.8, ratingCount: 19,
        tags: ['high-poly', 'pbr', 'realistic'], isFeatured: true,
      },

      // author2 — персонажи, природа
      {
        id: uuidv4(), authorId: author2Id, category: 'characters',
        title: 'Рыцарь в доспехах',
        description: 'Полностью зариггированный персонаж рыцаря с анимациями ходьбы, атаки и смерти. Готов к использованию в Unreal Engine 5.',
        price: 3800, isFree: false, status: 'published', polygons: 68000,
        software: 'Maya', license: 'standard', downloads: 89, views: 1240, rating: 4.9, ratingCount: 24,
        tags: ['rigged', 'animated', 'game-ready', 'pbr'], isFeatured: true,
      },
      {
        id: uuidv4(), authorId: author2Id, category: 'characters',
        title: 'Мультяшный котёнок',
        description: 'Милый мультяшный персонаж-котёнок для детских игр и анимации. Включает 5 базовых анимаций.',
        price: 1200, isFree: false, status: 'published', polygons: 8500,
        software: 'Blender', license: 'standard', downloads: 156, views: 2100, rating: 4.6, ratingCount: 43,
        tags: ['rigged', 'animated', 'cartoon', 'game-ready'], isFeatured: false,
      },
      {
        id: uuidv4(), authorId: author2Id, category: 'nature',
        title: 'Пак тропических деревьев',
        description: '15 уникальных тропических деревьев и кустарников с wind-анимацией. Оптимизировано для реального времени.',
        price: 0, isFree: true, status: 'published', polygons: 4200,
        software: 'Blender', license: 'free', downloads: 512, views: 4300, rating: 4.4, ratingCount: 67,
        tags: ['low-poly', 'game-ready', 'realtime', 'textures-included'], isFeatured: false,
      },
      {
        id: uuidv4(), authorId: author2Id, category: 'weapons',
        title: 'Фэнтезийный меч',
        description: 'Детализированный двуручный меч с магическими рунами. PBR текстуры, эффект свечения настроен через emission map.',
        price: 800, isFree: false, status: 'published', polygons: 6400,
        software: 'Blender', license: 'standard', downloads: 201, views: 1560, rating: 4.7, ratingCount: 38,
        tags: ['pbr', 'textures-included', 'fantasy', 'game-ready'], isFeatured: false,
      },
      {
        id: uuidv4(), authorId: author2Id, category: 'characters',
        title: 'Научный работник (NPC)',
        description: 'Персонаж учёного в белом халате для научных симуляторов и квестов. Риггинг совместим с Mixamo.',
        price: 2100, isFree: false, status: 'published', polygons: 42000,
        software: 'Maya', license: 'standard', downloads: 34, views: 480, rating: 4.2, ratingCount: 8,
        tags: ['rigged', 'game-ready', 'realistic'], isFeatured: false,
      },
      // На модерации
      {
        id: uuidv4(), authorId: author1Id, category: 'abstract',
        title: 'Кристаллическая структура',
        description: 'Абстрактная кристаллическая форма для архитектурных визуализаций и заставок.',
        price: 650, isFree: false, status: 'pending_review', polygons: 3200,
        software: 'Blender', license: 'standard', downloads: 0, views: 0, rating: 0, ratingCount: 0,
        tags: ['pbr'], isFeatured: false,
      },
    ]

    const modelIds = []
    for (const m of modelsData) {
      await client.query(
        `INSERT INTO models (id, author_id, category_id, title, description, price, is_free,
          status, polygon_count, software_used, license_type, preview_image_url, thumbnail_url,
          download_count, view_count, rating_avg, rating_count, is_featured)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
        [
          m.id, m.authorId, catMap[m.category] || null,
          m.title, m.description, m.price, m.isFree,
          m.status, m.polygons, m.software, m.license,
          PLACEHOLDER_IMAGE, PLACEHOLDER_THUMB,
          m.downloads, m.views, m.rating, m.ratingCount, m.isFeatured,
        ]
      )
      modelIds.push({ id: m.id, status: m.status })

      // Изображения
      await client.query(
        `INSERT INTO model_images (model_id, image_url, is_primary, sort_order) VALUES ($1,$2,TRUE,0)`,
        [m.id, `${PLACEHOLDER_IMAGE}&title=${encodeURIComponent(m.title)}`]
      )
      await client.query(
        `INSERT INTO model_images (model_id, image_url, is_primary, sort_order) VALUES ($1,$2,FALSE,1)`,
        [m.id, `https://placehold.co/600x400/1e40af/ffffff?text=Preview+2`]
      )

      // Файл
      await client.query(
        `INSERT INTO model_files (model_id, file_name, file_path, file_format, file_size_bytes, is_primary)
         VALUES ($1,$2,$3,$4,$5,TRUE)`,
        [m.id, `${m.title.replace(/\s+/g,'_')}.blend`, `/uploads/models/${m.id}/main.blend`, 'BLEND', Math.floor(Math.random() * 50 + 5) * 1024 * 1024]
      )

      // Теги
      for (const tagSlug of (m.tags || [])) {
        if (tagMap[tagSlug]) {
          await client.query(
            `INSERT INTO model_tags (model_id, tag_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
            [m.id, tagMap[tagSlug]]
          )
        }
      }
    }

    // ──────────────────────────────────────────────
    // ОТЗЫВЫ
    // ──────────────────────────────────────────────
    console.log('⭐ Добавляем отзывы...')
    const publishedModels = modelsData.filter(m => m.status === 'published')

    const reviewsData = [
      { modelIdx: 0, userId: buyer1Id, rating: 5, comment: 'Отличная модель! Очень детализированная, текстуры высокого качества.' },
      { modelIdx: 0, userId: buyer2Id, rating: 4, comment: 'Хорошая работа, но хотелось бы больше вариантов фасадов.' },
      { modelIdx: 1, userId: buyer1Id, rating: 5, comment: 'Потрясающий замок! Работа заслуживает наивысшей оценки.' },
      { modelIdx: 4, userId: buyer2Id, rating: 5, comment: 'Лучший автомобиль на платформе. Купил сразу.' },
      { modelIdx: 5, userId: buyer1Id, rating: 5, comment: 'Идеальный персонаж для моего проекта, всё работает из коробки.' },
      { modelIdx: 6, userId: buyer2Id, rating: 4, comment: 'Котёнок просто прелесть 😊 Анимации плавные.' },
    ]

    for (const r of reviewsData) {
      const model = publishedModels[r.modelIdx]
      if (model) {
        await client.query(
          `INSERT INTO reviews (model_id, user_id, rating, comment) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
          [model.id, r.userId, r.rating, r.comment]
        )
      }
    }

    // ──────────────────────────────────────────────
    // ЗАКАЗЫ
    // ──────────────────────────────────────────────
    console.log('🛒 Создаём заказы...')

    const paidModels = publishedModels.filter(m => !m.isFree)

    // Заказ 1 — buyer1
    const order1Id = uuidv4()
    const order1Models = [paidModels[0], paidModels[2]]
    const order1Total = order1Models.reduce((s, m) => s + m.price, 0)
    await client.query(
      `INSERT INTO orders (id, user_id, order_number, status, total_amount, payment_method)
       VALUES ($1,$2,$3,'completed',$4,'card')`,
      [order1Id, buyer1Id, 'ORD-2024-0001', order1Total]
    )
    for (const m of order1Models) {
      const oiId = uuidv4()
      await client.query(
        `INSERT INTO order_items (id, order_id, model_id, model_title, model_preview_url, author_id, price, license_type)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [oiId, order1Id, m.id, m.title, PLACEHOLDER_THUMB, m.authorId, m.price, m.license]
      )
      await client.query(
        `INSERT INTO licenses (order_item_id, user_id, model_id, license_key, license_type)
         VALUES ($1,$2,$3,$4,$5)`,
        [oiId, buyer1Id, m.id, `LIC-${uuidv4().slice(0,8).toUpperCase()}`, m.license]
      )
    }

    // Заказ 2 — buyer2
    const order2Id = uuidv4()
    const order2Models = [paidModels[4], paidModels[3]]
    const order2Total = order2Models.reduce((s, m) => s + m.price, 0)
    await client.query(
      `INSERT INTO orders (id, user_id, order_number, status, total_amount, payment_method)
       VALUES ($1,$2,$3,'paid',$4,'card')`,
      [order2Id, buyer2Id, 'ORD-2024-0002', order2Total]
    )
    for (const m of order2Models) {
      const oiId = uuidv4()
      await client.query(
        `INSERT INTO order_items (id, order_id, model_id, model_title, model_preview_url, author_id, price, license_type)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [oiId, order2Id, m.id, m.title, PLACEHOLDER_THUMB, m.authorId, m.price, m.license]
      )
      await client.query(
        `INSERT INTO licenses (order_item_id, user_id, model_id, license_key, license_type)
         VALUES ($1,$2,$3,$4,$5)`,
        [oiId, buyer2Id, m.id, `LIC-${uuidv4().slice(0,8).toUpperCase()}`, m.license]
      )
    }

    // ──────────────────────────────────────────────
    // ИЗБРАННОЕ
    // ──────────────────────────────────────────────
    console.log('❤️  Добавляем избранное...')
    const favItems = [
      [buyer1Id, publishedModels[5].id],
      [buyer1Id, publishedModels[1].id],
      [buyer2Id, publishedModels[4].id],
      [buyer2Id, publishedModels[6].id],
    ]
    for (const [uid, mid] of favItems) {
      await client.query(
        `INSERT INTO favorites (user_id, model_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
        [uid, mid]
      )
    }

    // ──────────────────────────────────────────────
    // КОРЗИНА
    // ──────────────────────────────────────────────
    console.log('🛍️  Наполняем корзины...')
    const cartItems = [
      [buyer1Id, publishedModels[8].id],
      [buyer2Id, publishedModels[0].id],
    ]
    for (const [uid, mid] of cartItems) {
      await client.query(
        `INSERT INTO cart_items (user_id, model_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
        [uid, mid]
      )
    }

    // ──────────────────────────────────────────────
    // ОЧЕРЕДЬ МОДЕРАЦИИ
    // ──────────────────────────────────────────────
    const pendingModel = modelsData.find(m => m.status === 'pending_review')
    if (pendingModel) {
      await client.query(
        `INSERT INTO moderation_queue (model_id, action, comment) VALUES ($1,'submitted','Отправлено на проверку')`,
        [pendingModel.id]
      )
    }

    await client.query('COMMIT')

    console.log('')
    console.log('✅ База данных успешно заполнена!')
    console.log('')
    console.log('👥 Пользователи:')
    console.log('   admin@rks.ru    / Admin1234   (admin)')
    console.log('   author1@rks.ru  / Author1234  (author)')
    console.log('   author2@rks.ru  / Author1234  (author)')
    console.log('   buyer1@rks.ru   / Buyer1234   (buyer)')
    console.log('   buyer2@rks.ru   / Buyer1234   (buyer)')
    console.log('')
    console.log(`📦 Моделей: ${modelsData.length} (${modelsData.filter(m=>m.status==='published').length} опубликовано, 1 на модерации)`)
    console.log('🛒 Заказов: 2')
    console.log('⭐ Отзывов: 6')

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
