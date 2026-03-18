import React, { createContext, useState, useCallback } from 'react'
import api, { setAuthTokens, clearAuthTokens, getRefreshToken } from '../services/api'

export const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const signIn = useCallback(async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password })
      setAuthTokens(data.accessToken, data.refreshToken)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: { message: error.response?.data?.error || error.message } }
    }
  }, [])

  const signUp = useCallback(async (email, password, additionalData = {}) => {
    try {
      const { data } = await api.post('/auth/register', {
        email,
        password,
        firstName: additionalData.first_name || additionalData.firstName,
        lastName: additionalData.last_name || additionalData.lastName,
        role: additionalData.role || 'buyer',
      })
      setAuthTokens(data.accessToken, data.refreshToken)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: { message: error.response?.data?.error || error.message } }
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      const refreshToken = getRefreshToken()
      await api.post('/auth/logout', { refreshToken })
    } catch {
      // ignore
    } finally {
      clearAuthTokens()
    }
    return { error: null }
  }, [])

  const value = {
    isAuthModalOpen,
    setIsAuthModalOpen,
    signIn,
    signUp,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
