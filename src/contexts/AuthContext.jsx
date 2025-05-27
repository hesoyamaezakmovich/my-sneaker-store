import React, { createContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import toast from 'react-hot-toast'

export const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  // Загрузка профиля пользователя - определяем ДО использования
  const loadProfile = async (userId, email) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      console.log('AuthContext: loadProfile result:', { data, error })
      if (error && error.code === 'PGRST116') {
        // Профиль не найден — создаём!
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: userId, email })
        if (insertError) throw insertError
        // Повторно загружаем профиль
        return await loadProfile(userId, email)
      }
      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('AuthContext: Error loading profile:', error)
      toast.error('Ошибка загрузки профиля')
    }
  }

  // Проверка текущего пользователя
  const checkUser = async () => {
    try {
      // Сначала проверяем сессию
      const { data: { session } } = await supabase.auth.getSession()
      console.log('AuthContext: checkUser session =', session)
      
      if (session?.user) {
        setUser(session.user)
        await loadProfile(session.user.id, session.user.email)
      } else {
        // Если нет сессии, пробуем получить пользователя
        const { data: { user } } = await supabase.auth.getUser()
        console.log('AuthContext: checkUser supabase.auth.getUser() =', user)
        if (user) {
          setUser(user)
          await loadProfile(user.id, user.email)
        } else {
          setUser(null)
          setProfile(null)
        }
      }
    } catch (error) {
      console.error('AuthContext: Error checking user:', error)
      // Не сбрасываем пользователя при ошибке
      if (error.message?.includes('JWT')) {
        // Только если токен истек
        setUser(null)
        setProfile(null)
      }
    } finally {
      setLoading(false)
    }
  }

  // Проверяем текущую сессию при загрузке
  useEffect(() => {
    checkUser()
    
    // Подписываемся на изменения состояния аутентификации
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session)
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          await loadProfile(session.user.id, session.user.email)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Регистрация
  const signUp = async (email, password, additionalData = {}) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: additionalData
        }
      })

      if (error) throw error

      // Создаем профиль пользователя
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            ...additionalData
          })

        if (profileError && profileError.code !== '23505') { // Игнорируем ошибку дубликата
          console.error('Error creating profile:', profileError)
        }
      }

      toast.success('Регистрация успешна! Проверьте email для подтверждения.')
      return { data, error: null }
    } catch (error) {
      console.error('Error signing up:', error)
      toast.error(error.message || 'Ошибка регистрации')
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // Вход
  const signIn = async (email, password) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      
      // Ждем немного, чтобы сессия установилась
      await new Promise(resolve => setTimeout(resolve, 100))
      await checkUser()
      
      toast.success('Вы успешно вошли в систему!')
      setIsAuthModalOpen(false)
      return { data, error: null }
    } catch (error) {
      console.error('Error signing in:', error)
      toast.error(error.message || 'Ошибка входа')
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // Выход
  const signOut = async () => {
    try {
      setLoading(true)
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      setProfile(null)
      toast.success('Вы вышли из системы')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Ошибка выхода')
    } finally {
      setLoading(false)
    }
  }

  // Сброс пароля
  const resetPassword = async (email) => {
    try {
      setLoading(true)
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      toast.success('Инструкции по сбросу пароля отправлены на email')
      return { error: null }
    } catch (error) {
      console.error('Error resetting password:', error)
      toast.error(error.message || 'Ошибка сброса пароля')
      return { error }
    } finally {
      setLoading(false)
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
      console.error('Error updating profile:', error)
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
      console.error('Error updating email:', error)
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
      console.error('Error updating password:', error)
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
    updatePassword,
    checkUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}