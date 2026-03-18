// Статусы заказов
export const ORDER_STATUSES = {
  PENDING_PAYMENT: 'pending_payment',
  PAID: 'paid',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
}

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUSES.PENDING_PAYMENT]: 'Ожидает оплаты',
  [ORDER_STATUSES.PAID]: 'Оплачен',
  [ORDER_STATUSES.COMPLETED]: 'Завершён',
  [ORDER_STATUSES.CANCELLED]: 'Отменён',
  [ORDER_STATUSES.REFUNDED]: 'Возврат',
}

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUSES.PENDING_PAYMENT]: 'yellow',
  [ORDER_STATUSES.PAID]: 'blue',
  [ORDER_STATUSES.COMPLETED]: 'green',
  [ORDER_STATUSES.CANCELLED]: 'red',
  [ORDER_STATUSES.REFUNDED]: 'gray',
}

// Статусы 3D-моделей
export const MODEL_STATUSES = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  PUBLISHED: 'published',
  REJECTED: 'rejected',
  ARCHIVED: 'archived',
}

export const MODEL_STATUS_LABELS = {
  [MODEL_STATUSES.DRAFT]: 'Черновик',
  [MODEL_STATUSES.PENDING_REVIEW]: 'На проверке',
  [MODEL_STATUSES.PUBLISHED]: 'Опубликована',
  [MODEL_STATUSES.REJECTED]: 'Отклонена',
  [MODEL_STATUSES.ARCHIVED]: 'В архиве',
}

// Форматы 3D-файлов
export const MODEL_FORMATS = ['OBJ', 'FBX', 'STL', 'GLTF', 'GLB', 'BLEND', 'MAX', 'MAYA', 'C4D', 'ZIP']

export const MODEL_FORMAT_LABELS = {
  OBJ: 'Wavefront OBJ',
  FBX: 'Autodesk FBX',
  STL: 'Stereolithography STL',
  GLTF: 'GL Transmission Format',
  GLB: 'Binary GLTF',
  BLEND: 'Blender',
  MAX: '3ds Max',
  MAYA: 'Maya',
  C4D: 'Cinema 4D',
  ZIP: 'ZIP архив',
}

// Типы лицензий
export const LICENSE_TYPES = {
  STANDARD: 'standard',
  EXTENDED: 'extended',
  EDITORIAL: 'editorial',
  FREE: 'free',
}

export const LICENSE_TYPE_LABELS = {
  [LICENSE_TYPES.STANDARD]: 'Стандартная',
  [LICENSE_TYPES.EXTENDED]: 'Расширенная',
  [LICENSE_TYPES.EDITORIAL]: 'Редакционная',
  [LICENSE_TYPES.FREE]: 'Бесплатная',
}

// Роли пользователей
export const USER_ROLES = {
  BUYER: 'buyer',
  AUTHOR: 'author',
  ADMIN: 'admin',
}

export const USER_ROLE_LABELS = {
  [USER_ROLES.BUYER]: 'Покупатель',
  [USER_ROLES.AUTHOR]: 'Автор',
  [USER_ROLES.ADMIN]: 'Администратор',
}

// Сортировка моделей
export const SORT_OPTIONS = {
  NEWEST: 'newest',
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
  POPULAR: 'popular',
  RATING: 'rating',
}

export const SORT_LABELS = {
  [SORT_OPTIONS.NEWEST]: 'Новинки',
  [SORT_OPTIONS.PRICE_ASC]: 'Цена: по возрастанию',
  [SORT_OPTIONS.PRICE_DESC]: 'Цена: по убыванию',
  [SORT_OPTIONS.POPULAR]: 'Популярные',
  [SORT_OPTIONS.RATING]: 'По рейтингу',
}

// Количество моделей на странице
export const MODELS_PER_PAGE = 12

// Маршруты приложения
export const ROUTES = {
  HOME: '/',
  CATALOG: '/catalog',
  MODEL: '/model/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  PROFILE: '/profile',
  ORDERS: '/orders',
  FAVORITES: '/favorites',
  AUTHOR_CABINET: '/author',
  AUTHOR_MODEL_NEW: '/author/models/new',
  AUTHOR_MODEL_EDIT: '/author/models/:id/edit',
  ABOUT: '/about',
  CONTACTS: '/contacts',
  TERMS: '/terms',
  PRIVACY: '/privacy',
}

// Конфигурация файлов
export const FILE_CONFIG = {
  MAX_MODEL_SIZE: 500 * 1024 * 1024, // 500MB
  MAX_PREVIEW_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_IMAGE_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ACCEPTED_MODEL_FORMATS: MODEL_FORMATS,
  DOWNLOAD_LINK_TTL_HOURS: 72,
}

// Регулярные выражения для валидации
export const REGEX = {
  EMAIL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PHONE: /^\+?[1-9]\d{1,14}$/,
}

// Сообщения об ошибках
export const ERROR_MESSAGES = {
  REQUIRED: 'Это поле обязательно',
  EMAIL_INVALID: 'Введите корректный email',
  PHONE_INVALID: 'Введите корректный номер телефона',
  PASSWORD_MIN: 'Пароль должен содержать минимум 6 символов',
  PASSWORDS_DONT_MATCH: 'Пароли не совпадают',
}
