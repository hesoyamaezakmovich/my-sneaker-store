# РКС 3D Маркетплейс

Веб-платформа для покупки, продажи и просмотра 3D-моделей. Авторы публикуют модели, покупатели приобретают лицензии и скачивают файлы. Реализован интерактивный просмотр 3D прямо в браузере без дополнительных плагинов.

**Демо:** https://176-108-255-28.sslip.io

---

## Стек технологий

### Фронтенд
| Технология | Версия | Назначение |
|---|---|---|
| React | 18 | UI-фреймворк |
| Vite | 5 | Сборщик |
| React Router DOM | 6 | Клиентский роутинг |
| TanStack Query | 5 | Серверное состояние, кэш |
| Zustand | 4 | Глобальное состояние (авторизация) |
| Tailwind CSS | 3 | Стили |
| Framer Motion | 10 | Анимации |
| @react-three/fiber | 8 | React-рендерер Three.js |
| @react-three/drei | 9 | Хелперы для Three.js |
| Three.js | 0.169 | 3D-движок |
| Axios | 1.6 | HTTP-клиент |
| React Hook Form | 7 | Формы |
| React Hot Toast | 2 | Уведомления |
| Lucide React | — | Иконки |
| Swiper | 11 | Слайдеры |

### Бэкенд
| Технология | Версия | Назначение |
|---|---|---|
| Node.js | 20 | Среда выполнения |
| Express | 4 | HTTP-сервер |
| PostgreSQL | 14+ | База данных |
| AWS SDK v3 | 3.600 | Работа с S3-совместимым хранилищем |
| JWT | — | Access-токены (15 мин) |
| UUID refresh-токены | — | Сессии (30 дней) |
| bcryptjs | 2 | Хэширование паролей |
| Multer | 1 | Загрузка файлов |
| PM2 | — | Process manager на сервере |

### Инфраструктура
- **VPS** — Ubuntu 22.04 (облако cloud.ru)
- **Nginx** — Reverse proxy + SSL
- **Let's Encrypt** — HTTPS-сертификат
- **cloud.ru Object Storage** — S3-совместимое хранилище для 3D-файлов и превью
- **GitHub Actions** — CI/CD: push в `main` → автодеплой на VPS по SSH

---

## Архитектура

```
Browser
  │
  ├── Nginx (443 / 80)
  │     ├── /api/* → Node.js :3001 (PM2)
  │     └── /*     → dist/ (статика React)
  │
  └── cloud.ru S3 (проксируется через /api/media/*)
        ├── previews/*.png   — превью моделей
        └── models/*.fbx     — 3D-файлы
```

### Почему файлы через прокси?
cloud.ru Object Storage требует подписанные запросы (tenant ID). Прямые публичные URL не поддерживаются. Сервер (`/api/media/*`) авторизуется в S3 и стримит файлы клиенту — так ключи не утекают во фронтенд.

---

## Структура проекта

```
my-sneaker-store/
├── src/                          # Фронтенд (React)
│   ├── components/
│   │   ├── auth/                 # Формы входа и регистрации
│   │   ├── layout/               # Header, Footer, Layout
│   │   ├── model/                # Карточки, список, 3D-просмотрщик
│   │   └── ui/                   # Button, Modal и др.
│   ├── pages/
│   │   ├── HomePage.jsx          # Главная со списком моделей и 3D-кубом
│   │   ├── CatalogPage.jsx       # Каталог с фильтрами
│   │   ├── ProductPage.jsx       # Карточка товара + 3D-просмотр
│   │   ├── CartPage.jsx          # Корзина
│   │   ├── CheckoutPage.jsx      # Оформление заказа
│   │   ├── OrdersPage.jsx        # История заказов
│   │   ├── FavoritesPage.jsx     # Избранное
│   │   ├── ProfilePage.jsx       # Профиль пользователя
│   │   ├── AuthorCabinetPage.jsx # Кабинет автора
│   │   └── admin/                # Панель администратора
│   ├── hooks/                    # useAuth, useCartMutations, useUserQuery
│   ├── services/                 # Axios-сервисы (auth, models, cart, orders)
│   ├── store/                    # Zustand-стор авторизации
│   └── utils/                    # Константы, хелперы
│
├── server/                       # Бэкенд (Node.js / Express)
│   ├── routes/
│   │   ├── auth.js               # Регистрация, вход, refresh, выход
│   │   ├── models.js             # CRUD моделей, поиск, фильтры
│   │   ├── cart.js               # Корзина
│   │   ├── orders.js             # Заказы, генерация токенов скачивания
│   │   ├── payments.js           # ЮKassa webhook
│   │   ├── favorites.js          # Избранное
│   │   ├── support.js            # Поддержка / чат
│   │   ├── upload.js             # Загрузка изображений и 3D-файлов в S3
│   │   ├── media.js              # Прокси для файлов из S3
│   │   ├── files.js              # Скачивание файлов по download-токену
│   │   └── admin.js              # Управление пользователями, модерация
│   ├── middleware/
│   │   └── auth.js               # JWT-проверка, роли
│   ├── db.js                     # Пул соединений PostgreSQL
│   └── index.js                  # Точка входа Express
│
├── database/
│   ├── schema.sql                # Полная схема БД
│   ├── seed.cjs                  # Тестовые данные (20 моделей Polyhaven)
│   └── upload-polyhaven.cjs      # Скрипт загрузки CC0-моделей в S3
│
├── .github/workflows/
│   └── deploy.yml                # CI/CD GitHub Actions
└── setup.sh                      # Скрипт первичной установки на VPS
```

---

## База данных

### Таблицы

| Таблица | Описание |
|---|---|
| `users` | Пользователи (buyer / author / admin), UUID PK |
| `profiles` | Профили: имя, аватар, bio |
| `refresh_tokens` | UUID refresh-токены сессий |
| `categories` | Иерархические категории моделей |
| `tags` | Теги (low-poly, pbr, game-ready и др.) |
| `models` | 3D-модели: цена, статус, рейтинг, счётчики |
| `model_images` | Превью-изображения модели |
| `model_files` | Файлы модели (FBX, GLB, OBJ и др.) |
| `model_tags` | M2M: модели ↔ теги |
| `moderation_queue` | Очередь модерации |
| `reviews` | Отзывы покупателей |
| `cart_items` | Корзина |
| `favorites` | Избранное |
| `orders` | Заказы |
| `order_items` | Позиции заказа |
| `licenses` | Лицензии после оплаты |
| `download_tokens` | Одноразовые токены скачивания (TTL 72 ч) |
| `support_chats` | Чаты поддержки |
| `support_messages` | Сообщения поддержки |
| `settings` | Настройки платформы |

### Роли пользователей

| Роль | Возможности |
|---|---|
| `buyer` | Просмотр каталога, корзина, оплата, скачивание |
| `author` | Всё что buyer + публикация моделей в кабинете автора |
| `admin` | Всё + панель управления, модерация, пользователи |

---

## API

Базовый URL: `/api`

### Авторизация — `/api/auth`
| Метод | Путь | Описание |
|---|---|---|
| POST | `/register` | Регистрация |
| POST | `/login` | Вход, возвращает access + refresh токены |
| POST | `/refresh` | Обновление access-токена |
| POST | `/logout` | Выход, инвалидация refresh-токена |
| GET | `/me` | Данные текущего пользователя |

### Модели — `/api/models`
| Метод | Путь | Описание |
|---|---|---|
| GET | `/` | Список с фильтрами (category, tag, price, sort, search) |
| GET | `/:id` | Детали модели |
| GET | `/meta/categories` | Все категории |
| GET | `/meta/tags` | Все теги |
| GET | `/:id/similar` | Похожие модели |
| POST | `/` | Создать модель (author/admin) |
| PUT | `/:id` | Обновить модель (автор/admin) |
| DELETE | `/:id` | Удалить модель (автор/admin) |

### Корзина — `/api/cart`
| Метод | Путь | Описание |
|---|---|---|
| GET | `/` | Содержимое корзины |
| POST | `/` | Добавить модель |
| DELETE | `/:modelId` | Удалить из корзины |
| DELETE | `/` | Очистить корзину |

### Заказы — `/api/orders`
| Метод | Путь | Описание |
|---|---|---|
| GET | `/` | История заказов пользователя |
| POST | `/` | Создать заказ из корзины |
| GET | `/downloads/:licenseId` | Получить ссылки для скачивания |

### Файлы — `/api/files`
| Метод | Путь | Описание |
|---|---|---|
| GET | `/download/:token` | Скачать файл по одноразовому токену |

### Медиа-прокси — `/api/media`
| Метод | Путь | Описание |
|---|---|---|
| GET | `/*` | Стриминг файла из S3 (без экспозиции ключей) |

### Загрузка — `/api/upload` *(только admin)*
| Метод | Путь | Описание |
|---|---|---|
| POST | `/image` | Загрузить JPG/PNG/WebP в S3 |
| POST | `/model` | Загрузить FBX/GLB/OBJ/BLEND в S3 |

### Платежи — `/api/payments`
| Метод | Путь | Описание |
|---|---|---|
| POST | `/webhook` | Webhook ЮKassa (подтверждение оплаты) |

---

## Ключевые функции

### Интерактивный 3D-просмотрщик
На странице товара кнопка **«Просмотр 3D модели»** открывает модальное окно с полноценным 3D-рендером:

- Загрузка FBX через `FBXLoader` (Three.js)
- Текстуры перехватываются через `LoadingManager` и заменяются пустым пикселем — нет 404, нет краша WebGL
- Все материалы заменяются на `MeshStandardMaterial` (clay render)
- `<Center>` из drei — автоматическое центрирование любой модели
- `OrbitControls` — вращение, зум, панорамирование мышью
- Автовращение при бездействии
- Сброс камеры кнопкой
- Lazy-загрузка (Three.js ~1MB подгружается только для страниц с товаром)

### Система авторизации
- Access-токен (JWT, 15 мин) + Refresh-токен (UUID, 30 дней)
- Refresh хранится в PostgreSQL, инвалидируется при выходе
- Middleware `authenticate` + `requireRole('admin'|'author')` на защищённых роутах

### Система скачивания
После оплаты генерируются `download_tokens` с TTL 72 часа. Файл скачивается через `/api/files/download/:token` — сервер авторизуется в S3 и стримит файл с правильным `Content-Disposition: attachment`.

### Загрузка моделей в S3
Администратор загружает файлы через панель управления:
- Изображения → `images/{uuid}.ext`
- 3D-файлы → `models/{uuid}.ext`
- Лимит файла — 500 МБ

### Скрипт наполнения данными
`database/upload-polyhaven.cjs` — автоматически скачивает CC0-модели с Polyhaven.com и загружает в S3:
- Рекурсивный поиск GLB/FBX/OBJ в структуре Polyhaven API
- Загрузка 20 моделей: превью PNG + 3D-файл FBX
- URL сохраняются в `seed.cjs`

---

## Установка и запуск

### Требования
- Node.js 20+
- PostgreSQL 14+
- npm

### Локальная разработка

**1. Клонировать репозиторий**
```bash
git clone https://github.com/hesoyamaezakmovich/my-sneaker-store.git
cd my-sneaker-store
```

**2. Создать базу данных**
```bash
createdb rks_3d_marketplace
psql -d rks_3d_marketplace -f database/schema.sql
```

**3. Настроить переменные окружения бэкенда**

Создать файл `server/.env`:
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rks_3d_marketplace
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_DAYS=30

FRONTEND_URL=http://localhost:5173

# cloud.ru S3 (или любой S3-совместимый)
S3_ENDPOINT=https://s3.cloud.ru
S3_REGION=ru-central-1
S3_BUCKET=your-bucket-name
S3_TENANT_ID=your-tenant-id
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key

# ЮKassa (опционально)
YOOKASSA_SHOP_ID=your_shop_id
YOOKASSA_SECRET_KEY=your_secret_key

DOWNLOAD_LINK_TTL_HOURS=72
```

**4. Запустить бэкенд**
```bash
cd server
npm install
npm run dev
```

**5. Запустить фронтенд**
```bash
# В корне проекта
npm install --legacy-peer-deps
npm run dev
```

Фронтенд доступен на `http://localhost:5173`, API на `http://localhost:3001`.

**6. Заполнить тестовыми данными**
```bash
node database/seed.cjs
```

### Тестовые аккаунты после seed

| Email | Пароль | Роль |
|---|---|---|
| admin@rks.ru | Admin1234 | Администратор |
| author1@rks.ru | Author1234 | Автор |
| author2@rks.ru | Author1234 | Автор |
| buyer1@rks.ru | Buyer1234 | Покупатель |
| buyer2@rks.ru | Buyer1234 | Покупатель |

---

## Деплой на VPS

### Первичная установка

```bash
# Скопировать setup.sh на сервер и выполнить от root
chmod +x setup.sh
./setup.sh
```

Скрипт автоматически:
- Устанавливает Node.js 20, PostgreSQL, Nginx, PM2, Certbot
- Создаёт БД и применяет схему
- Клонирует репозиторий
- Настраивает Nginx с HTTPS (Let's Encrypt через sslip.io)
- Запускает бэкенд через PM2
- Собирает фронтенд

### CI/CD

При каждом `git push` в ветку `main` GitHub Actions:
1. Подключается к VPS по SSH
2. Выполняет `git pull`
3. Устанавливает зависимости бэкенда (`server/npm install`)
4. Перезапускает PM2 (`pm2 restart rks-api`)
5. Устанавливает зависимости фронтенда (`npm install --legacy-peer-deps`)
6. Собирает фронтенд (`VITE_API_URL=https://... npm run build`)

Секрет `SSH_PRIVATE_KEY` добавить в **Settings → Secrets → Actions** репозитория.

---

## Переменные окружения

### Фронтенд (`.env` в корне)
```env
VITE_API_URL=http://localhost:3001
```
> В CI/CD переопределяется: `VITE_API_URL=https://176-108-255-28.sslip.io npm run build`

### Бэкенд (`server/.env`)
Все переменные описаны в разделе «Установка» выше.

---

## Скрипты

| Команда | Описание |
|---|---|
| `npm run dev` | Запуск фронтенда в dev-режиме |
| `npm run build` | Сборка фронтенда для продакшена |
| `cd server && npm run dev` | Запуск бэкенда с nodemon |
| `node database/seed.cjs` | Заполнить БД тестовыми данными |
| `node database/upload-polyhaven.cjs` | Загрузить CC0-модели из Polyhaven в S3 |

---

## Лицензия

Проект выполнен в рамках дипломной работы АРОО «РКС».  
3D-модели — [Polyhaven](https://polyhaven.com), лицензия CC0.
