import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useUserQuery } from '../../hooks/useUserQuery'
import { useProfileQuery } from '../../hooks/useProfileQuery'
import Loader from '../common/Loader'

const AdminRoute = () => {
  const { data: user, isLoading: userLoading } = useUserQuery()
  const { data: profile, isLoading: profileLoading } = useProfileQuery(user?.id)

  // Показываем загрузчик пока проверяем авторизацию
  if (userLoading || (user && profileLoading)) {
    return <Loader fullScreen text="Проверка прав доступа..." />
  }

  // Если пользователь не авторизован
  if (!user) {
    return <Navigate to="/" replace />
  }

  // Проверяем, является ли пользователь администратором
  // В вашей БД нужно добавить поле is_admin в таблицу profiles
  if (!profile?.is_admin) {
    return <Navigate to="/" replace />
  }

  // Если все проверки пройдены, показываем админский контент
  return <Outlet />
}

export default AdminRoute