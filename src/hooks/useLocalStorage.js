import { useState, useEffect } from 'react'

export const useLocalStorage = (key, initialValue) => {
  // Функция для получения начального значения
  const getInitialValue = () => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  }

  // State для хранения значения
  const [storedValue, setStoredValue] = useState(getInitialValue)

  // Функция для обновления значения
  const setValue = (value) => {
    try {
      // Позволяем value быть функцией
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      setStoredValue(valueToStore)
      
      // Сохраняем в localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
      
      // Отправляем событие для синхронизации между вкладками
      window.dispatchEvent(new Event('local-storage'))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  // Функция для удаления значения
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
      window.dispatchEvent(new Event('local-storage'))
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }

  // Слушаем изменения localStorage в других вкладках
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(getInitialValue())
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('local-storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('local-storage', handleStorageChange)
    }
  }, [key])

  return [storedValue, setValue, removeValue]
}