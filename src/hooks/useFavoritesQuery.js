import { useQuery } from '@tanstack/react-query'
import { fetchFavorites } from '../services/favorites.service'
import { getAccessToken } from '../services/api'

export const useFavoritesQuery = () => {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
    enabled: !!getAccessToken(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}
