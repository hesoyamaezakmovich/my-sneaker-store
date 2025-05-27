import React, { createContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import toast from 'react-hot-toast'

export const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  // Мемоизированная функция загрузки профиля
  const loadProfile = useCallback(async (userId, email) => {
    try {
      console.log('AuthContext: Loading profile for user:', userId)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      console.log('AuthContext: Profile query result:', { data, error })
      
      if (error && error.code === 'PGRST116') {
        // Профиль не найден — создаём
        console.log('AuthContext: Creating new profile')
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: userId, email })
        
        if (insertError) {
          console.error('AuthContext: Error creating profile:', insertError)
          throw insertError
        }
        
        // Повторно загружаем профиль
        const { data: newProfileData, error: newProfileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
        
        if (newProfileError) throw newProfileError
        setProfile(newProfileData)
        console.log('AuthContext: Profile created successfully')
        return
      }
      
      if (error) throw error
      setProfile(data)
      console.log('AuthContext: Profile loaded successfully')
    } catch (error) {
      console.error('AuthContext: Error loading profile:', error)
      // Не показываем toast при каждой ошибке загрузки профиля
      // toast.error('Ошибка загрузки профиля')
    }
  }, [])

  // Инициализация пользователя при загрузке приложения
  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      try {
        console.log('AuthContext: Initializing auth...')
        
        // Получаем текущую сессию
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('AuthContext: Error getting session:', error)
          if (isMounted) {
            setUser(null)
            setProfile(null)
            setLoading(false)
          }
          return
        }

        if (session?.user && isMounted) {
          console.log('AuthContext: Session found, setting user')
          setUser(session.user)
          await loadProfile(session.user.id, session.user.email)
        } else if (isMounted) {
          console.log('AuthContext: No session found')
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('AuthContext: Error initializing auth:', error)
        if (isMounted) {
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      isMounted = false
    }
  }, [loadProfile])

  // Подписка на изменения состояния аутентификации
  useEffect(() => {
    console.log('AuthContext: Setting up auth state listener')
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed:', event, !!session?.user)
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          await loadProfile(session.user.id, session.user.email)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
        }
        // Не меняем loading здесь, так как он уже управляется в initializeAuth
      }
    )

    return () => {
      console.log('AuthContext: Cleaning up auth state listener')
      subscription.unsubscribe()
    }
  }, [loadProfile])

  // Регистрация
  const signUp = async (email, password, additionalData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: additionalData
        }
      })

      if (error) throw error

      toast.success('Регистрация успешна! Проверьте email для подтверждения.')
      return { data, error: null }
    } catch (error) {
      console.error('AuthContext: Error signing up:', error)
      toast.error(error.message || 'Ошибка регистрации')
      return { data: null, error }
    }
  }

  // Вход
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      toast.success('Вы успешно вошли в систему!')
      setIsAuthModalOpen(false)
      return { data, error: null }
    } catch (error) {
      console.error('AuthContext: Error signing in:', error)
      return { data: null, error }
    }
  }

  // Выход
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast.success('Вы вышли из системы')
    } catch (error) {
      console.error('AuthContext: Error signing out:', error)
      toast.error('Ошибка выхода')
    }
  }

  // Сброс пароля
  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      toast.success('Инструкции по сбросу пароля отправлены на email')
      return { error: null }
    } catch (error) {
      console.error('AuthContext: Error resetting password:', error)
      toast.error(error.message || 'Ошибка сброса пароля')
      return { error }
    }
  }

  // Обновление профиля
  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('Пользователь не авторизован')

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      toast.success('Профиль обновлен')
      return { data, error: null }
    } catch (error) {
      console.error('AuthContext: Error updating profile:', error)
      toast.error('Ошибка обновления профиля')
      return { data: null, error }
    }
  }

  // Обновление email
  const updateEmail = async (newEmail) => {
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail })
      
      if (error) throw error

      toast.success('Email обновлен. Проверьте почту для подтверждения.')
      return { error: null }
    } catch (error) {
      console.error('AuthContext: Error updating email:', error)
      toast.error('Ошибка обновления email')
      return { error }
    }
  }

  // Обновление пароля
  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      
      if (error) throw error

      toast.success('Пароль успешно изменен')
      return { error: null }
    } catch (error) {
      console.error('AuthContext: Error updating password:', error)
      toast.error('Ошибка изменения пароля')
      return { error }
    }
  }

  const value = {
    user,
    profile,
    loading,
    isAuthModalOpen,
    setIsAuthModalOpen,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    updateEmail,
    updatePassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}