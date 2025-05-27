import { createClient } from '@supabase/supabase-js'

// Получаем переменные окружения
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const isDevelopment = import.meta.env.DEV || process.env.NODE_ENV === 'development'

// Проверяем наличие переменных
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Отсутствуют переменные окружения Supabase. Проверьте файл .env')
}

// Создаем клиент Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Для Vercel важно правильно настроить URL
    flowType: 'pkce'
  },
  // Для продакшена на Vercel
  global: {
    headers: {
      'x-application-name': 'bro-shop'
    }
  }
})

// Хелпер для обработки ошибок Supabase
export const handleSupabaseError = (error) => {
  if (error) {
    console.error('Supabase error:', error)
    
    // Обработка специфических ошибок
    if (error.message.includes('JWT')) {
      return 'Сессия истекла. Пожалуйста, войдите снова.'
    }
    
    if (error.message.includes('duplicate key')) {
      return 'Такая запись уже существует.'
    }
    
    if (error.message.includes('violates foreign key')) {
      return 'Ошибка связи данных.'
    }
    
    return error.message || 'Произошла неизвестная ошибка'
  }
  
  return null
}

// Хелпер для загрузки изображений
export const uploadImage = async (file, bucket = 'products') => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { data, error } = await supabase.storage
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

const checkUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    console.log('checkUser: user =', user)
    // ... остальной код
  } catch (error) {
    console.error('Error checking user:', error)
  } finally {
    setLoading(false)
  }
}