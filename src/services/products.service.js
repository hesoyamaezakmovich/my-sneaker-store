import { supabase, handleSupabaseError } from './supabase'

// Получить все товары с деталями
export const fetchProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`*, brand:brands(*), category:categories(*), images:product_images(*), sizes:product_sizes(*, size:sizes(*))`)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw new Error(handleSupabaseError(error))
  return data
}

// Получить товар по id с деталями
export const fetchProductById = async (id) => {
  const { data, error } = await supabase
    .from('products')
    .select(`*, brand:brands(*), category:categories(*), images:product_images(*), sizes:product_sizes(*, size:sizes(*))`)
    .eq('id', id)
    .single()

  if (error) throw new Error(handleSupabaseError(error))
  return data
}

// Получить все категории
export const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })
  if (error) throw new Error(handleSupabaseError(error))
  return data
}

// Получить все бренды
export const fetchBrands = async () => {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name', { ascending: true })
  if (error) throw new Error(handleSupabaseError(error))
  return data
}

// Получить все размеры
export const fetchSizes = async () => {
  const { data, error } = await supabase
    .from('sizes')
    .select('*')
    .order('size_value', { ascending: true })
  if (error) throw new Error(handleSupabaseError(error))
  return data
}

// (Опционально) Добавить товар
export const addProduct = async (product) => {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single()

  if (error) throw new Error(handleSupabaseError(error))
  return data
}

// (Опционально) Обновить товар
export const updateProduct = async (id, updates) => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(handleSupabaseError(error))
  return data
}

// (Опционально) Удалить товар
export const deleteProduct = async (id) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw new Error(handleSupabaseError(error))
  return true
}

// Получить похожие товары по категории (и исключить текущий товар)
export const fetchSimilarProducts = async (categoryId, excludeProductId, limit = 4) => {
  const { data, error } = await supabase
    .from('products')
    .select(`*, brand:brands(*), category:categories(*), images:product_images(*), sizes:product_sizes(*, size:sizes(*))`)
    .eq('is_active', true)
    .eq('category_id', categoryId)
    .neq('id', excludeProductId)
    .limit(limit)
    .order('created_at', { ascending: false })

  if (error) throw new Error(handleSupabaseError(error))
  return data
}
