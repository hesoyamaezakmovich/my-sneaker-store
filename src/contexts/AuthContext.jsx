import React, { createContext, useState } from 'react'
import { supabase } from '../services/supabase'

export const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    })
    return { data, error }
  }

  const signUp = async (email, password, additionalData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: additionalData 
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const value = {
    isAuthModalOpen,
    setIsAuthModalOpen,
    signIn,
    signUp,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}