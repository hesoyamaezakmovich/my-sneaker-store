import React, { createContext, useState } from 'react'

export const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const value = {
    isAuthModalOpen,
    setIsAuthModalOpen
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}