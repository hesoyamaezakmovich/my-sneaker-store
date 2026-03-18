import { useQuery } from '@tanstack/react-query'
import api, { getAccessToken } from '../services/api'

export const useUserQuery = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me')
      return data.user
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!getAccessToken(),
  })
}
