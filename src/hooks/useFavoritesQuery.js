import { useQuery } from '@tanstack/react-query'
import { fetchFavorites } from '../services/favorites.service'

export const useFavoritesQuery = (userId) => {
  return useQuery({
    queryKey: ['favorites', userId],
    queryFn: () => fetchFavorites(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}