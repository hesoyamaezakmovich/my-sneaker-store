import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useUserQuery } from '../hooks/useUserQuery'
import { useProfileQuery } from '../hooks/useProfileQuery'
import { useUpdateProfile } from '../hooks/useAuthMutations'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import UserOrdersPreview from '../components/common/UserOrdersPreview'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { data: user, isLoading: userLoading } = useUserQuery()
  const { data: profile, isLoading: profileLoading } = useProfileQuery(user?.id)
  const updateProfileMutation = useUpdateProfile()
  const [edit, setEdit] = useState(false)
  const [form, setForm] = useState(null)

  useEffect(() => {
    if (profile) setForm(profile)
  }, [profile])

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSave = async e => {
    e.preventDefault()
    if (!user) return
    try {
      await updateProfileMutation.mutateAsync({ userId: user.id, updates: form })
      setEdit(false)
      toast.success('Профиль успешно сохранён!')
    } catch {
      toast.error('Ошибка сохранения профиля')
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Вы успешно вышли из аккаунта')
      navigate('/')
    } catch (error) {
      toast.error('Ошибка при выходе')
    }
  }

  if (userLoading || profileLoading || !form) return <div className="max-w-2xl mx-auto px-4 py-8">Загрузка...</div>
  if (!user) return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col items-center justify-center text-gray-400">
      <div className="text-xl mb-2">Войдите, чтобы просматривать профиль</div>
      <button className="mt-4 bg-black text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-800 transition" onClick={() => window.location.href = '/'}>На главную</button>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Профиль</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Выйти
        </button>
      </div>
      <form className="bg-white rounded-xl shadow p-6" onSubmit={handleSave}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input name="first_name" value={form.first_name || ''} onChange={handleChange} required placeholder="Имя" className="input" disabled={!edit} />
          <input name="last_name" value={form.last_name || ''} onChange={handleChange} required placeholder="Фамилия" className="input" disabled={!edit} />
          <input name="phone" value={form.phone || ''} onChange={handleChange} required placeholder="Телефон" className="input" disabled={!edit} />
          <input name="email" value={form.email || ''} onChange={handleChange} required placeholder="Email" className="input" disabled={!edit} />
          <input name="address" value={form.address || ''} onChange={handleChange} required placeholder="Адрес" className="input col-span-2" disabled={!edit} />
          <input name="city" value={form.city || ''} onChange={handleChange} required placeholder="Город" className="input" disabled={!edit} />
          <input name="postal_code" value={form.postal_code || ''} onChange={handleChange} required placeholder="Индекс" className="input" disabled={!edit} />
        </div>
        {updateProfileMutation.isError && <div className="text-red-500 mb-4">Ошибка сохранения профиля</div>}
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
      <UserOrdersPreview />
    </div>
  )
}