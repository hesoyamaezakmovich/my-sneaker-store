import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from './useAuth'

export const useSignIn = () => {
  const queryClient = useQueryClient()
  const { signIn } = useAuth()

  return useMutation({
    mutationFn: async ({ email, password }) => {
      const { data, error } = await signIn(email, password)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      toast.success('Вы успешно вошли!')
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
    onError: (error) => {
      toast.error(error.message || 'Ошибка входа')
    },
  })
}

export const useSignUp = () => {
  const queryClient = useQueryClient()
  const { signUp } = useAuth()

  return useMutation({
    mutationFn: async ({ email, password, additionalData }) => {
      const { data, error } = await signUp(email, password, additionalData)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      toast.success('Регистрация успешна! Добро пожаловать!')
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
    onError: (error) => {
      toast.error(error.message || 'Ошибка регистрации')
    },
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates) => {
      const { data } = await api.patch('/auth/profile', updates)
      return data.profile
    },
    onSuccess: () => {
      toast.success('Профиль обновлён')
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
    onError: (error) => {
      toast.error(error.message || 'Ошибка обновления профиля')
    },
  })
}
