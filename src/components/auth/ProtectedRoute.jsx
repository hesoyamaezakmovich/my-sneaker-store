import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useUserQuery } from '../../hooks/useUserQuery'
import Loader from '../common/Loader'

const ProtectedRoute = () => {
  const location = useLocation()
  const { data: user, isLoading: loading } = useUserQuery()

  // Показываем загрузчик пока проверяем аутентификацию
  if (loading) {
    return <Loader fullScreen text="Проверка авторизации..." />
  }

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!user) {
    // Сохраняем путь, куда пользователь хотел попасть
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Если авторизован, показываем защищенный контент
  return <Outlet />
}

export default ProtectedRoute