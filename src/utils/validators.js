import { REGEX, ERROR_MESSAGES } from './constants'

// Валидация email
export const validateEmail = (email) => {
  if (!email) {
    return ERROR_MESSAGES.REQUIRED
  }
  
  if (!REGEX.EMAIL.test(email)) {
    return ERROR_MESSAGES.EMAIL_INVALID
  }
  
  return null
}

// Валидация пароля
export const validatePassword = (password) => {
  if (!password) {
    return ERROR_MESSAGES.REQUIRED
  }
  
  if (password.length < 6) {
    return ERROR_MESSAGES.PASSWORD_MIN
  }
  
  return null
}

// Валидация подтверждения пароля
export const validatePasswordConfirm = (password, confirmPassword) => {
  if (!confirmPassword) {
    return ERROR_MESSAGES.REQUIRED
  }
  
  if (password !== confirmPassword) {
    return ERROR_MESSAGES.PASSWORDS_DONT_MATCH
  }
  
  return null
}

// Валидация телефона
export const validatePhone = (phone) => {
  if (!phone) {
    return ERROR_MESSAGES.REQUIRED
  }
  
  const cleanPhone = phone.replace(/\D/g, '')
  
  if (!REGEX.PHONE.test(cleanPhone)) {
    return ERROR_MESSAGES.PHONE_INVALID
  }
  
  return null
}

// Валидация обязательного поля
export const validateRequired = (value) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return ERROR_MESSAGES.REQUIRED
  }
  
  return null
}

// Валидация почтового индекса
export const validatePostalCode = (postalCode) => {
  if (!postalCode) {
    return ERROR_MESSAGES.REQUIRED
  }
  
  if (!REGEX.POSTAL_CODE.test(postalCode)) {
    return 'Введите корректный почтовый индекс (6 цифр)'
  }
  
  return null
}

// Валидация минимальной длины
export const validateMinLength = (value, minLength) => {
  if (!value) {
    return ERROR_MESSAGES.REQUIRED
  }
  
  if (value.length < minLength) {
    return `Минимальная длина: ${minLength} символов`
  }
  
  return null
}

// Валидация максимальной длины
export const validateMaxLength = (value, maxLength) => {
  if (value && value.length > maxLength) {
    return `Максимальная длина: ${maxLength} символов`
  }
  
  return null
}

// Валидация числа
export const validateNumber = (value, min, max) => {
  if (!value && value !== 0) {
    return ERROR_MESSAGES.REQUIRED
  }
  
  const num = Number(value)
  
  if (isNaN(num)) {
    return 'Введите число'
  }
  
  if (min !== undefined && num < min) {
    return `Минимальное значение: ${min}`
  }
  
  if (max !== undefined && num > max) {
    return `Максимальное значение: ${max}`
  }
  
  return null
}

// Композиция валидаторов
export const composeValidators = (...validators) => (value) => {
  for (const validator of validators) {
    const error = validator(value)
    if (error) return error
  }
  return null
}

// Валидация формы
export const validateForm = (values, validationRules) => {
  const errors = {}
  
  Object.keys(validationRules).forEach(field => {
    const fieldValidators = validationRules[field]
    const value = values[field]
    
    if (Array.isArray(fieldValidators)) {
      for (const validator of fieldValidators) {
        const error = validator(value)
        if (error) {
          errors[field] = error
          break
        }
      }
    } else {
      const error = fieldValidators(value)
      if (error) {
        errors[field] = error
      }
    }
  })
  
  return errors
}

// Проверка наличия ошибок
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0
}

// Валидация изображения
export const validateImage = (file, maxSize = 5 * 1024 * 1024) => {
  if (!file) {
    return ERROR_MESSAGES.REQUIRED
  }
  
  if (file.size > maxSize) {
    return `Максимальный размер файла: ${maxSize / 1024 / 1024}MB`
  }
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return 'Разрешены только изображения (JPEG, PNG, WebP)'
  }
  
  return null
}