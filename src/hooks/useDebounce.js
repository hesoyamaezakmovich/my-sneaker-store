import { useState, useEffect } from 'react'

export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Устанавливаем таймер
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Отменяем таймер при изменении value или delay
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}