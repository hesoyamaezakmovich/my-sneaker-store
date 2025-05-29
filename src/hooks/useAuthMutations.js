import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import toast from 'react-hot-toast'

export const useSignIn = () => {
  const queryClient = useQueryClient()
  return useMutation(
    async ({ email, password }) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return data
    },
    {
      onSuccess: () => {
        toast.success('Вы успешно вошли!')
        queryClient.invalidateQueries(['user'])
      },
      onError: (error) => {
        toast.error(error.message || 'Ошибка входа')
      }
    }
  )
}

export const useSignUp = () => {
  const queryClient = useQueryClient()
  return useMutation(
    async ({ email, password, additionalData }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: additionalData }
      })
      if (error) throw error
      return data
    },
    {
      onSuccess: () => {
        toast.success('Регистрация успешна! Проверьте email.')
        queryClient.invalidateQueries(['user'])
      },
      onError: (error) => {
        toast.error(error.message || 'Ошибка регистрации')
      }
    }
  )
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  return useMutation(
    async ({ userId, updates }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
      if (error) throw error
      return data
    },
    {
      onSuccess: (_, { userId }) => {
        toast.success('Профиль обновлен')
        queryClient.invalidateQueries(['profile', userId])
      },
      onError: (error) => {
        toast.error(error.message || 'Ошибка обновления профиля')
      }
    }
  )
} 