import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { addToCart, removeFromCart, clearCart } from '../services/cart.service'

export const useAddToCart = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (modelId) => addToCart(modelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Модель добавлена в корзину')
    },
    onError: (e) => {
      toast.error(e.message || 'Ошибка добавления в корзину')
    },
  })
}

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (modelId) => removeFromCart(modelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Модель удалена из корзины')
    },
    onError: (e) => {
      toast.error(e.message || 'Ошибка удаления из корзины')
    },
  })
}

export const useClearCart = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
    onError: (e) => {
      toast.error(e.message || 'Ошибка очистки корзины')
    },
  })
}
