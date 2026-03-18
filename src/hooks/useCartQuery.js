import { useQuery } from '@tanstack/react-query'
import { fetchCart } from '../services/cart.service'
import { getAccessToken } from '../services/api'

export const useCartQuery = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
    enabled: !!getAccessToken(),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  })
}
