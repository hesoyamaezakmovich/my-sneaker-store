import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

const RegisterForm = ({ onSuccess, onSwitch }) => {
  const { signUp } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', password2: '', first_name: '', last_name: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.password !== form.password2) {
      setError('Пароли не совпадают!')
      return
    }
    setLoading(true)
    const { error } = await signUp(form.email, form.password, { first_name: form.first_name, last_name: form.last_name })
    setLoading(false)
    if (error) setError('Ошибка регистрации. Попробуйте другой email.')
    else if (onSuccess) onSuccess()
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <input
        name="first_name"
        type="text"
        required
        placeholder="Имя"
        className={`input ${error ? 'input-error' : ''}`}
        value={form.first_name}
        onChange={handleChange}
        autoFocus
      />
      <input
        name="last_name"
        type="text"
        required
        placeholder="Фамилия"
        className={`input ${error ? 'input-error' : ''}`}
        value={form.last_name}
        onChange={handleChange}
      />
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
      <input
        name="password2"
        type="password"
        required
        placeholder="Повторите пароль"
        className={`input ${error ? 'input-error' : ''}`}
        value={form.password2}
        onChange={handleChange}
      />
      {error && <div className="form-error">{error}</div>}
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={loading}
      >
        Зарегистрироваться
      </button>
      <div className="text-center text-sm mt-2">
        Уже есть аккаунт?{' '}
        <button type="button" className="text-blue-600 hover:underline" onClick={onSwitch}>
          Войти
        </button>
      </div>
    </form>
  )
}

export default RegisterForm
