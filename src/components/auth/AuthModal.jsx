import React, { useState } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

const AuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen } = useAuth()
  const [mode, setMode] = useState('login')

  if (!isAuthModalOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={() => setIsAuthModalOpen(false)}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-8 relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
          onClick={() => setIsAuthModalOpen(false)}
          style={{ boxShadow: 'none' }}
          aria-label="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white text-center mb-6">
          {mode === 'login' ? 'Войти в аккаунт' : 'Регистрация'}
        </h2>

        {mode === 'login' ? (
          <LoginForm
            onSwitch={() => setMode('register')}
            onSuccess={() => setIsAuthModalOpen(false)}
          />
        ) : (
          <RegisterForm
            onSwitch={() => setMode('login')}
            onSuccess={() => setIsAuthModalOpen(false)}
          />
        )}
      </div>
    </div>
  )
}

export default AuthModal
