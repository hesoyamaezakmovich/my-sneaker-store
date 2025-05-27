import { supabase, handleSupabaseError } from './supabase'

// Получить корзину пользователя с деталями товара и размера
export const fetchCart = async (userId) => {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`*, product:products(*, brand:brands(*), category:categories(*), images:product_images(*)), size:sizes(*)`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(handleSupabaseError(error))
  return data
}

// Добавить товар в корзину (или увеличить количество)
export const addToCart = async (userId, productId, sizeId, quantity = 1) => {
  // Проверяем, есть ли уже такой товар с этим размером в корзине
  const { data: existing, error: fetchError } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .eq('size_id', sizeId)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') throw new Error(handleSupabaseError(fetchError))

  if (existing) {
    // Если есть — увеличиваем количество
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw new Error(handleSupabaseError(error))
    return data
  } else {
    // Если нет — добавляем новую запись
    const { data, error } = await supabase
      .from('cart_items')
      .insert([{ user_id: userId, product_id: productId, size_id: sizeId, quantity }])
      .select()
      .single()
    if (error) throw new Error(handleSupabaseError(error))
    return data
  }
}

// Изменить количество товара в корзине
export const updateCartItem = async (userId, productId, sizeId, quantity) => {
  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('user_id', userId)
    .eq('product_id', productId)
    .eq('size_id', sizeId)
    .select()
    .single()
  if (error) throw new Error(handleSupabaseError(error))
  return data
}

// Удалить товар из корзины
export const removeFromCart = async (userId, productId, sizeId) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)
    .eq('size_id', sizeId)
  if (error) throw new Error(handleSupabaseError(error))
  return true
}

// Очистить корзину
export const clearCart = async (userId) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
  if (error) throw new Error(handleSupabaseError(error))
  return true
}
