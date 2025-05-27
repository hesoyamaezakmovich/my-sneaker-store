// Форматирование цены
export const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }
  
  // Генерация уникального ID
  export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
  
  // Генерация номера заказа
  export const generateOrderNumber = () => {
    const date = new Date()
    const year = date.getFullYear().toString().substr(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    
    return `${year}${month}${day}-${random}`
  }
  
  // Дебаунс функция
  export const debounce = (func, wait) => {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }
  
  // Проверка, является ли объект пустым
  export const isEmptyObject = (obj) => {
    return Object.keys(obj).length === 0
  }
  
  // Глубокое клонирование объекта
  export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj))
  }
  
  // Получение параметров из URL
  export const getQueryParams = (url) => {
    const params = new URLSearchParams(url)
    const result = {}
    
    for (const [key, value] of params) {
      result[key] = value
    }
    
    return result
  }
  
  // Построение URL с параметрами
  export const buildUrl = (baseUrl, params) => {
    const url = new URL(baseUrl)
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        url.searchParams.append(key, params[key])
      }
    })
    
    return url.toString()
  }
  
  // Сокращение строки
  export const truncateString = (str, maxLength) => {
    if (str.length <= maxLength) return str
    return str.slice(0, maxLength) + '...'
  }
  
  // Перемешивание массива
  export const shuffleArray = (array) => {
    const arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }
  
  // Группировка массива по ключу
  export const groupBy = (array, key) => {
    return array.reduce((result, item) => {
      const group = item[key]
      if (!result[group]) result[group] = []
      result[group].push(item)
      return result
    }, {})
  }
  
  // Проверка, находится ли элемент в viewport
  export const isInViewport = (element) => {
    const rect = element.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }
  
  // Плавная прокрутка к элементу
  export const scrollToElement = (elementId) => {
    const element = document.getElementById(elementId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
  
  // Получение случайных элементов из массива
  export const getRandomItems = (array, count) => {
    const shuffled = shuffleArray(array)
    return shuffled.slice(0, count)
  }