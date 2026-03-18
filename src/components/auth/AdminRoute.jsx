import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useUserQuery } from '../../hooks/useUserQuery'
import Loader from '../common/Loader'

const AdminRoute = () => {
  const { data: user, isLoading } = useUserQuery()

  if (isLoading) {
    return <Loader fullScreen text="Проверка прав доступа..." />
  }

  if (!user) return <Navigate to="/" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />

  return <Outlet />
}

export default AdminRoute
