import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Loader from '../common/Loader'

const ProtectedRoute = () => {
  const { user, loading } = useAuth()
  const location = useLocation()

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