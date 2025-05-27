import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

const LoginForm = ({ onSuccess, onSwitch }) => {
  console.log('LoginForm rendered')
  const { signIn } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async e => {
    console.log('handleSubmit called')
    e.preventDefault()
    setLoading(true)
    try {
      const { error: signInError, data } = await signIn(form.email, form.password)
      setLoading(false)
      console.log('signIn finished')
      console.log('signIn result:', { error: signInError, data })
      if (signInError) {
        setError('Неверный email или пароль')
        toast.error(signInError.message || 'Ошибка входа')
      }
      else if (onSuccess) onSuccess()
    } catch (err) {
      setLoading(false)
      console.log('signIn threw error:', err)
      setError('Ошибка входа (catch)')
      toast.error(err.message || 'Ошибка входа (catch)')
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
        Войти
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
