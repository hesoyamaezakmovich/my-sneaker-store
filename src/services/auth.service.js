import { supabase, handleSupabaseError } from './supabase'

// Регистрация пользователя
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw new Error(handleSupabaseError(error))
  return data
}

// Вход пользователя
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(handleSupabaseError(error))
  return data
}

// Выход пользователя
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(handleSupabaseError(error))
  return true
}

// Получить текущего пользователя
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw new Error(handleSupabaseError(error))
  return data.user
}

// Получить профиль пользователя
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw new Error(handleSupabaseError(error))
  return data
}

// Обновить профиль пользователя
export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw new Error(handleSupabaseError(error))
  return data
}
