import React, { useEffect, useState } from 'react'
import { getProfile, updateProfile } from '../services/auth.service'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postal_code: '',
  })
  const [loading, setLoading] = useState(true)
  const [edit, setEdit] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setProfile({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        postal_code: '',
      })
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    getProfile(user.id)
      .then(setProfile)
      .catch(() => setError('Ошибка загрузки профиля'))
      .finally(() => setLoading(false))
  }, [user])

  const handleChange = e => {
    setProfile(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  const handleSave = async e => {
    e.preventDefault()
    if (!user) return
    setError(null)
    try {
      await updateProfile(user.id, profile)
      setEdit(false)
      toast.success('Профиль успешно сохранён!')
    } catch {
      setError('Ошибка сохранения профиля')
      toast.error('Ошибка сохранения профиля')
    }
  }

  if (authLoading) return <div className="max-w-2xl mx-auto px-4 py-8">Загрузка...</div>
  if (!user) return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col items-center justify-center text-gray-400">
      <div className="text-xl mb-2">Войдите, чтобы просматривать профиль</div>
      <button className="mt-4 bg-black text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-800 transition" onClick={() => window.location.href = '/'}>На главную</button>
    </div>
  )

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8">Загрузка...</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Профиль</h1>
      <form className="bg-white rounded-xl shadow p-6" onSubmit={handleSave}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input name="first_name" value={profile.first_name} onChange={handleChange} required placeholder="Имя" className="input" disabled={!edit} />
          <input name="last_name" value={profile.last_name} onChange={handleChange} required placeholder="Фамилия" className="input" disabled={!edit} />
          <input name="phone" value={profile.phone} onChange={handleChange} required placeholder="Телефон" className="input" disabled={!edit} />
          <input name="email" value={profile.email} onChange={handleChange} required placeholder="Email" className="input" disabled={!edit} />
          <input name="address" value={profile.address} onChange={handleChange} required placeholder="Адрес" className="input col-span-2" disabled={!edit} />
          <input name="city" value={profile.city} onChange={handleChange} required placeholder="Город" className="input" disabled={!edit} />
          <input name="postal_code" value={profile.postal_code} onChange={handleChange} required placeholder="Индекс" className="input" disabled={!edit} />
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {edit ? (
          <button type="submit" className="w-full bg-black text-white rounded py-3 font-semibold text-lg hover:bg-gray-800 transition">
            Сохранить
          </button>
        ) : (
          <button type="button" className="w-full bg-gray-200 text-gray-800 rounded py-3 font-semibold text-lg hover:bg-gray-300 transition" onClick={() => setEdit(true)}>
            Редактировать
          </button>
        )}
      </form>
    </div>
  )
}
