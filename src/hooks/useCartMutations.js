import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import toast from 'react-hot-toast'

export const useAddToCart = (userId) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ productId, sizeId, quantity }) => {
      const { data, error } = await supabase
        .from('cart_items')
        .insert({ user_id: userId, product_id: productId, size_id: sizeId, quantity })
        .select(`*, product:products(*, brand:brands(*), category:categories(*), images:product_images(*)), size:sizes(*)`)
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] })
      toast.success('Товар добавлен в корзину')
    },
    onError: (e) => {
      toast.error(e.message || 'Ошибка добавления в корзину')
    }
  })
}

export const useUpdateCartQuantity = (userId) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ itemId, quantity }) => {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .eq('user_id', userId)
      if (error) throw error
      return { itemId, quantity }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] })
    },
    onError: (e) => {
      toast.error(e.message || 'Ошибка обновления количества')
    }
  })
}

export const useRemoveFromCart = (userId) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (itemId) => {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', userId)
      if (error) throw error
      return itemId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] })
      toast.success('Товар удален из корзины')
    },
    onError: (e) => {
      toast.error(e.message || 'Ошибка удаления из корзины')
    }
  })
}

export const useClearCart = (userId) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] })
      toast.success('Корзина очищена')
    },
    onError: (e) => {
      toast.error(e.message || 'Ошибка очистки корзины')
    }
  })
}