import { useUserQuery } from './useUserQuery'

// Профиль теперь включён в useUserQuery (user.profile)
export const useProfileQuery = () => {
  const { data: user, ...rest } = useUserQuery()
  return { data: user?.profile || null, ...rest }
}
