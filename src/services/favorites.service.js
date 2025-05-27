import { supabase, handleSupabaseError } from './supabase'

// Получить избранное пользователя с деталями товара
export const fetchFavorites = async (userId) => {
  const { data, error } = await supabase
    .from('favorites')
    .select('*, product:products(*, brand:brands(*), category:categories(*), images:product_images(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(handleSupabaseError(error))
  return data
}

// Добавить в избранное
export const addToFavorites = async (userId, productId) => {
  const { data, error } = await supabase
    .from('favorites')
    .insert([{ user_id: userId, product_id: productId }])
    .select()
    .single()
  if (error) throw new Error(handleSupabaseError(error))
  return data
}

// Удалить из избранного
export const removeFromFavorites = async (userId, productId) => {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)
  if (error) throw new Error(handleSupabaseError(error))
  return true
}
