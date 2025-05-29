import { useQuery } from '@tanstack/react-query'
import { supabase } from '../services/supabase'

export const useUserQuery = () => {
  return useQuery(['user'], async () => {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    return data.user
  }, {
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
} 