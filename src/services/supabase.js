// Этот файл оставлен для обратной совместимости.
// Supabase заменён на прямое подключение к PostgreSQL через REST API.
// Используйте src/services/api.js для всех запросов к серверу.
export const supabase = null
export const handleSupabaseError = (err) => err?.message || 'Ошибка'
export const safeSupabaseCall = async (fn) => fn()
export const uploadImage = async () => { throw new Error('Используйте API для загрузки файлов') }
export const getImageUrl = () => null
export const checkSupabaseConnection = async () => false
export const monitorAuthState = () => ({ unsubscribe: () => {} })
