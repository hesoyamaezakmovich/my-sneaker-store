import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

const LoginForm = ({ onSuccess, onSwitch }) => {
  const { signIn } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const { error: signInError, data } = await signIn(form.email, form.password)
      
      if (signInError) {
        setError('Неверный email или пароль')
        toast.error(signInError.message || 'Ошибка входа')
      } else if (data?.user) {
        // Инвалидируем все запросы пользователя после входа
        queryClient.invalidateQueries(['user'])
        queryClient.invalidateQueries(['profile'])
        queryClient.invalidateQueries(['cart'])
        queryClient.invalidateQueries(['favorites'])
        
        toast.success('Вы успешно вошли!')
        if (onSuccess) onSuccess()
      }
    } catch (err) {
      console.error('signIn error:', err)
      setError('Ошибка входа')
      toast.error(err.message || 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        className={`input ${error ? 'input-error' : ''}`}
        value={form.email}
        onChange={handleChange}
        autoFocus
      />
      <input
        name="password"
        type="password"
        required
        placeholder="Пароль"
        className={`input ${error ? 'input-error' : ''}`}
        value={form.password}
        onChange={handleChange}
      />
      {error && <div className="form-error">{error}</div>}
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={loading}
      >
        {loading ? 'Вход...' : 'Войти'}
      </button>
      <div className="text-center text-sm mt-2">
        Нет аккаунта?{' '}
        <button type="button" className="text-blue-600 hover:underline" onClick={onSwitch}>
          Зарегистрироваться
        </button>
      </div>
    </form>
  )
}

export default LoginForm