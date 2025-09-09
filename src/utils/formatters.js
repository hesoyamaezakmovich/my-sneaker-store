import { format, formatDistance, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

// Форматирование даты
export const formatDate = (date, formatString = 'dd.MM.yyyy') => {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatString, { locale: ru })
}

// Форматирование даты и времени
export const formatDateTime = (date) => {
  return formatDate(date, 'dd.MM.yyyy HH:mm')
}

// Относительное время (например: "2 часа назад")
export const formatRelativeTime = (date) => {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return formatDistance(dateObj, new Date(), { addSuffix: true, locale: ru })
}

// Форматирование телефона
export const formatPhone = (phone) => {
  if (!phone) return ''
  
  // Удаляем все нецифровые символы
  const cleaned = phone.replace(/\D/g, '')
  
  // Форматируем в зависимости от длины
  if (cleaned.length === 11 && cleaned.startsWith('7')) {
    // Российский формат: +7 (XXX) XXX-XX-XX
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`
  }
  
  return phone
}

// Форматирование номера карты
export const formatCardNumber = (cardNumber) => {
  if (!cardNumber) return ''
  
  const cleaned = cardNumber.replace(/\s/g, '')
  const groups = cleaned.match(/.{1,4}/g)
  
  return groups ? groups.join(' ') : cleaned
}

// Маскирование номера карты (показываем только последние 4 цифры)
export const maskCardNumber = (cardNumber) => {
  if (!cardNumber || cardNumber.length < 4) return ''
  
  const cleaned = cardNumber.replace(/\s/g, '')
  const lastFour = cleaned.slice(-4)
  
  return `•••• •••• •••• ${lastFour}`
}

// Форматирование размера файла
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Склонение слов
export const pluralize = (count, words) => {
  // words = ['товар', 'товара', 'товаров']
  const cases = [2, 0, 1, 1, 1, 2]
  return words[(count % 100 > 4 && count % 100 < 20) ? 2 : cases[(count % 10 < 5) ? count % 10 : 5]]
}

// Форматирование количества товаров
export const formatProductCount = (count) => {
  return `${count} ${pluralize(count, ['товар', 'товара', 'товаров'])}`
}

// Форматирование адреса
export const formatAddress = (address) => {
  if (!address) return ''
  
  const parts = []
  
  if (address.city) parts.push(address.city)
  if (address.street) parts.push(address.street)
  if (address.building) parts.push(`д. ${address.building}`)
  if (address.apartment) parts.push(`кв. ${address.apartment}`)
  
  return parts.join(', ')
}

// Форматирование имени пользователя
export const formatUserName = (user) => {
  if (!user) return ''
  
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`
  }
  
  if (user.firstName) return user.firstName
  if (user.email) return user.email.split('@')[0]
  
  return 'Пользователь'
}

// Форматирование процентов
export const formatPercent = (value, decimals = 0) => {
  return `${value.toFixed(decimals)}%`
}

// Форматирование скидки
export const formatDiscount = (originalPrice, discountedPrice) => {
  const discount = Math.round((1 - discountedPrice / originalPrice) * 100)
  return `-${discount}%`
}