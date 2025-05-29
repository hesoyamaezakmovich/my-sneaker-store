import { useQuery } from '@tanstack/react-query'
import { supabase } from '../services/supabase'

export const useCartQuery = (userId) => {
  return useQuery({
    queryKey: ['cart', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('cart_items')
        .select(`*, product:products(*, brand:brands(*), category:categories(*), images:product_images(*)), size:sizes(*)`)
        .eq('user_id', userId)
      if (error) throw error
      return data || []
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}