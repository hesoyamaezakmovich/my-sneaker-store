// Статусы заказов
export const ORDER_STATUSES = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
  }
  
  export const ORDER_STATUS_LABELS = {
    [ORDER_STATUSES.PENDING]: 'Ожидает подтверждения',
    [ORDER_STATUSES.PROCESSING]: 'В обработке',
    [ORDER_STATUSES.SHIPPED]: 'Отправлен',
    [ORDER_STATUSES.DELIVERED]: 'Доставлен',
    [ORDER_STATUSES.CANCELLED]: 'Отменен'
  }
  
  // Размеры кроссовок
  export const SHOE_SIZES = [
    36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46
  ]
  
  // Сортировка
  export const SORT_OPTIONS = {
    NEWEST: 'newest',
    PRICE_ASC: 'price_asc',
    PRICE_DESC: 'price_desc',
    POPULAR: 'popular'
  }
  
  export const SORT_LABELS = {
    [SORT_OPTIONS.NEWEST]: 'Новинки',
    [SORT_OPTIONS.PRICE_ASC]: 'Цена: по возрастанию',
    [SORT_OPTIONS.PRICE_DESC]: 'Цена: по убыванию',
    [SORT_OPTIONS.POPULAR]: 'Популярные'
  }
  
  // Количество товаров на странице
  export const PRODUCTS_PER_PAGE = 12
  
  // Роуты приложения
  export const ROUTES = {
    HOME: '/',
    CATALOG: '/catalog',
    PRODUCT: '/product/:id',
    CART: '/cart',
    CHECKOUT: '/checkout',
    PROFILE: '/profile',
    ORDERS: '/orders',
    FAVORITES: '/favorites',
    LOGIN: '/login',
    REGISTER: '/register'
  }
  
  // Регулярные выражения для валидации
  export const REGEX = {
    EMAIL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    PHONE: /^\+?[1-9]\d{1,14}$/,
    POSTAL_CODE: /^\d{6}$/
  }
  
  // Сообщения об ошибках
  export const ERROR_MESSAGES = {
    REQUIRED: 'Это поле обязательно',
    EMAIL_INVALID: 'Введите корректный email',
    PHONE_INVALID: 'Введите корректный номер телефона',
    PASSWORD_MIN: 'Пароль должен содержать минимум 6 символов',
    PASSWORDS_DONT_MATCH: 'Пароли не совпадают'
  }
  
  // Настройки изображений
  export const IMAGE_CONFIG = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ACCEPTED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    THUMBNAIL_SIZE: 150,
    PRODUCT_IMAGE_SIZE: 800
  }