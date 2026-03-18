-- ============================================================
-- База данных: Маркетплейс 3D-моделей АРОО «РКС»
-- PostgreSQL Schema
-- ============================================================

-- Расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ПОЛЬЗОВАТЕЛИ И РОЛИ
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'author', 'admin')),
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  display_name VARCHAR(150),
  avatar_url TEXT,
  bio TEXT,
  phone VARCHAR(30),
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- КАТЕГОРИИ И ТЕГИ
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 3D МОДЕЛИ
-- ============================================================

CREATE TABLE IF NOT EXISTS models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  is_free BOOLEAN DEFAULT FALSE,
  status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published', 'rejected', 'archived')),
  rejection_reason TEXT,
  polygon_count INTEGER,
  software_used VARCHAR(100),
  license_type VARCHAR(50) DEFAULT 'standard' CHECK (license_type IN ('standard', 'extended', 'editorial', 'free')),
  preview_image_url TEXT,
  thumbnail_url TEXT,
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  rating_avg NUMERIC(3, 2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS model_tags (
  model_id UUID REFERENCES models(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (model_id, tag_id)
);

-- Файлы 3D-модели (OBJ, FBX, STL, GLTF, BLEND и др.)
CREATE TABLE IF NOT EXISTS model_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_format VARCHAR(20) NOT NULL CHECK (file_format IN ('OBJ', 'FBX', 'STL', 'GLTF', 'GLB', 'BLEND', 'MAX', 'MAYA', 'C4D', 'ZIP')),
  file_size_bytes BIGINT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Изображения-превью 3D-модели (до 10MB)
CREATE TABLE IF NOT EXISTS model_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- КОРЗИНА
-- ============================================================

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, model_id)
);

-- ============================================================
-- ЗАКАЗЫ
-- ============================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'paid', 'completed', 'cancelled', 'refunded')),
  total_amount NUMERIC(12, 2) NOT NULL,
  payment_method VARCHAR(50),
  payment_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE RESTRICT,
  model_title VARCHAR(255) NOT NULL,
  model_preview_url TEXT,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  price NUMERIC(12, 2) NOT NULL,
  license_type VARCHAR(50) DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- ЛИЦЕНЗИИ И ЗАГРУЗКИ
-- ============================================================

CREATE TABLE IF NOT EXISTS licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  license_key VARCHAR(100) UNIQUE NOT NULL,
  license_type VARCHAR(50) NOT NULL DEFAULT 'standard',
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Временные ссылки для скачивания (pre-signed URLs)
CREATE TABLE IF NOT EXISTS download_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  license_id UUID NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
  model_file_id UUID NOT NULL REFERENCES model_files(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- ИЗБРАННОЕ
-- ============================================================

CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  model_id UUID REFERENCES models(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, model_id)
);

-- ============================================================
-- ОТЗЫВЫ И РЕЙТИНГИ
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (model_id, user_id)
);

-- ============================================================
-- МОДЕРАЦИЯ
-- ============================================================

CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  moderator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(30) CHECK (action IN ('submitted', 'approved', 'rejected', 'revision_requested')),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- НАСТРОЙКИ МАГАЗИНА
-- ============================================================

CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- ПОДДЕРЖКА (ЧАТ)
-- ============================================================

CREATE TABLE IF NOT EXISTS support_chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES support_chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sender_role VARCHAR(20) DEFAULT 'user' CHECK (sender_role IN ('user', 'admin', 'system')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- ИНДЕКСЫ ДЛЯ ПРОИЗВОДИТЕЛЬНОСТИ
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_models_status ON models(status);
CREATE INDEX IF NOT EXISTS idx_models_author ON models(author_id);
CREATE INDEX IF NOT EXISTS idx_models_category ON models(category_id);
CREATE INDEX IF NOT EXISTS idx_models_price ON models(price);
CREATE INDEX IF NOT EXISTS idx_models_created ON models(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_models_featured ON models(is_featured) WHERE is_featured = TRUE;

CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_licenses_user ON licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_licenses_model ON licenses(model_id);
CREATE INDEX IF NOT EXISTS idx_download_tokens_token ON download_tokens(token);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

-- ============================================================
-- ТРИГГЕРЫ: авто-обновление updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_models_updated_at BEFORE UPDATE ON models FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_support_chats_updated_at BEFORE UPDATE ON support_chats FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ТРИГГЕР: автосоздание профиля при регистрации
-- ============================================================

CREATE OR REPLACE FUNCTION create_profile_on_user_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles(id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_profile AFTER INSERT ON users FOR EACH ROW EXECUTE FUNCTION create_profile_on_user_insert();

-- ============================================================
-- ТРИГГЕР: обновление рейтинга модели при новом отзыве
-- ============================================================

CREATE OR REPLACE FUNCTION update_model_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE models SET
    rating_avg = (SELECT AVG(rating) FROM reviews WHERE model_id = NEW.model_id),
    rating_count = (SELECT COUNT(*) FROM reviews WHERE model_id = NEW.model_id)
  WHERE id = NEW.model_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_model_rating AFTER INSERT OR UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_model_rating();

-- ============================================================
-- НАЧАЛЬНЫЕ ДАННЫЕ
-- ============================================================

-- Категории
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Архитектура', 'architecture', 'Архитектурные 3D-модели зданий и сооружений', 1),
  ('Персонажи', 'characters', 'Персонажи для игр и анимации', 2),
  ('Транспорт', 'transport', 'Автомобили, самолёты, корабли и другой транспорт', 3),
  ('Природа', 'nature', 'Деревья, растения, камни, вода', 4),
  ('Интерьер', 'interior', 'Мебель, декор и предметы интерьера', 5),
  ('Техника', 'tech', 'Электроника, механизмы, инструменты', 6),
  ('Оружие', 'weapons', 'Исторические и фантастические виды оружия', 7),
  ('Еда', 'food', '3D-модели блюд и продуктов питания', 8),
  ('Абстракция', 'abstract', 'Абстрактные и декоративные объекты', 9),
  ('Медицина', 'medicine', 'Медицинские инструменты и органы', 10)
ON CONFLICT (slug) DO NOTHING;

-- Теги
INSERT INTO tags (name, slug) VALUES
  ('low-poly', 'low-poly'),
  ('high-poly', 'high-poly'),
  ('PBR', 'pbr'),
  ('game-ready', 'game-ready'),
  ('rigged', 'rigged'),
  ('animated', 'animated'),
  ('textures-included', 'textures-included'),
  ('realtime', 'realtime'),
  ('sci-fi', 'sci-fi'),
  ('fantasy', 'fantasy'),
  ('realistic', 'realistic'),
  ('cartoon', 'cartoon')
ON CONFLICT (slug) DO NOTHING;

-- Настройки по умолчанию
INSERT INTO settings (key, value, description) VALUES
  ('site_name', 'РКС 3D Маркетплейс', 'Название сайта'),
  ('site_description', 'Маркетплейс 3D-моделей АРОО «РКС»', 'Описание сайта'),
  ('currency', 'RUB', 'Валюта'),
  ('commission_rate', '15', 'Процент комиссии с продаж автора (%)'),
  ('max_file_size_mb', '500', 'Максимальный размер файла модели (МБ)'),
  ('max_preview_size_mb', '10', 'Максимальный размер превью (МБ)'),
  ('download_link_ttl_hours', '72', 'Время жизни ссылки для скачивания (часов)'),
  ('moderation_required', 'true', 'Требуется ли модерация перед публикацией'),
  ('primary_color', '#2563eb', 'Основной цвет интерфейса'),
  ('show_brand_logos', 'true', 'Показывать логотипы авторов')
ON CONFLICT (key) DO NOTHING;
