import { supabase, handleSupabaseError } from './supabase'

// Создать заказ и позиции заказа
export const createOrder = async (order, items) => {
  // order: { user_id, order_number, total_amount, ... }
  // items: [{ product_id, size_id, quantity, price, ... }]
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single()
  if (orderError) throw new Error(handleSupabaseError(orderError))

  // Добавляем позиции заказа
  const orderItems = items.map(item => ({ ...item, order_id: orderData.id }))
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)
  if (itemsError) throw new Error(handleSupabaseError(itemsError))

  return orderData
}

// Получить заказы пользователя с деталями
export const fetchOrdersByUser = async (userId) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*, product:products(*), size:sizes(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(handleSupabaseError(error))
  return data
}

// Получить заказ по id с деталями
export const fetchOrderById = async (orderId) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*, product:products(*), size:sizes(*))')
    .eq('id', orderId)
    .single()
  if (error) throw new Error(handleSupabaseError(error))
  return data
}
