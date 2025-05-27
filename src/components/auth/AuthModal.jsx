import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

const AuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen } = useAuth()
  const [mode, setMode] = useState('login')

  if (!isAuthModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl"
          onClick={() => setIsAuthModalOpen(false)}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-6 text-center">
          {mode === 'login' ? 'Вход' : 'Регистрация'}
        </h2>
        {mode === 'login' ? (
          <LoginForm onSwitch={() => setMode('register')} onSuccess={() => setIsAuthModalOpen(false)} />
        ) : (
          <RegisterForm onSwitch={() => setMode('login')} onSuccess={() => setIsAuthModalOpen(false)} />
        )}
      </div>
    </div>
  )
}

export default AuthModal