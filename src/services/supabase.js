import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Отсутствуют переменные окружения Supabase. Проверьте файл .env')
}

// Создаем клиент Supabase с улучшенной конфигурацией
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'bro-shop-auth-token',
  },
  global: {
    headers: {
      'x-application-name': 'bro-shop'
    },
    fetch: (url, options = {}) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 секунд
      
      return fetch(url, {
        ...options,
        signal: controller.signal
      }).finally(() => {
        clearTimeout(timeoutId)
      })
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
})

export const handleSupabaseError = (error) => {
  if (error) {
    console.error('Supabase error:', error)
    
    // Обработка специфических ошибок
    if (error.message?.includes('JWT') || error.message?.includes('token')) {
      return 'Сессия истекла. Пожалуйста, войдите снова.'
    }
    
    if (error.message?.includes('duplicate key')) {
      return 'Такая запись уже существует.'
    }
    
    if (error.message?.includes('violates foreign key')) {
      return 'Ошибка связи данных.'
    }
    
    if (error.message?.includes('Failed to fetch')) {
      return 'Ошибка соединения. Проверьте интернет-подключение.'
    }
    
    if (error.message?.includes('timeout')) {
      return 'Превышено время ожидания. Попробуйте еще раз.'
    }
    
    return error.message || 'Произошла неизвестная ошибка'
  }
  
  return null
}

// Функция для безопасного выполнения запросов с повторными попытками
export const safeSupabaseCall = async (fn, retries = 3) => {
  let lastError = null
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Не повторяем при ошибках аутентификации
      if (error.message?.includes('JWT') || 
          error.message?.includes('token') ||
          error.status === 401) {
        throw error
      }
      
      // Ждем перед повторной попыткой (экспоненциальная задержка)
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
      }
    }
  }
  
  throw lastError
}

// Хелпер для загрузки изображений
export const uploadImage = async (file, bucket = 'products') => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file)

    if (error) {
      throw error
    }

    // Получаем публичный URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

// Хелпер для получения URL изображения
export const getImageUrl = (path, bucket = 'products') => {
  if (!path) return null
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  
  return data.publicUrl
}

// Функция для проверки состояния соединения
export const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('profiles').select('count').limit(1)
    return !error
  } catch {
    return false
  }
}

// Экспортируем функцию для мониторинга состояния auth
export const monitorAuthState = () => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    console.log(`[Supabase Auth] Event: ${event}, Session: ${!!session}`)
    
    if (event === 'TOKEN_REFRESHED') {
      console.log('[Supabase Auth] Token refreshed at:', new Date().toISOString())
    }
    
    if (event === 'SIGNED_OUT') {
      console.log('[Supabase Auth] User signed out at:', new Date().toISOString())
    }
    
    if (event === 'USER_UPDATED') {
      console.log('[Supabase Auth] User updated at:', new Date().toISOString())
    }
  })
  
  return subscription
}