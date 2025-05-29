import { useQuery } from '@tanstack/react-query'
import { supabase } from '../services/supabase'

export const useProfileQuery = (userId) => {
  return useQuery(['profile', userId], async () => {
    if (!userId) return null
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  }, {
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
} 