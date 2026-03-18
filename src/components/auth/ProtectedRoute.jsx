import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useUserQuery } from '../../hooks/useUserQuery'
import Loader from '../common/Loader'
import { getAccessToken } from '../../services/api'

const ProtectedRoute = () => {
  const location = useLocation()
  const { data: user, isLoading } = useUserQuery()

  if (isLoading) {
    return <Loader fullScreen text="Проверка авторизации..." />
  }

  if (!user && !getAccessToken()) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
