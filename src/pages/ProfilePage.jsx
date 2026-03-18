import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { LogOut, User, Mail, Phone, Globe, FileText } from 'lucide-react'
import { useUserQuery } from '../hooks/useUserQuery'
import { useUpdateProfile } from '../hooks/useAuthMutations'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { clearAuthTokens } from '../services/api'
import { USER_ROLE_LABELS } from '../utils/constants'

export default function ProfilePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: user, isLoading } = useUserQuery()
  const updateProfileMutation = useUpdateProfile()
  const { signOut } = useAuth()
  const [edit, setEdit] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => {
    if (user?.profile) {
      setForm({
        firstName: user.profile.first_name || '',
        lastName: user.profile.last_name || '',
        displayName: user.profile.display_name || '',
        bio: user.profile.bio || '',
        phone: user.profile.phone || '',
        websiteUrl: user.profile.website_url || '',
      })
    }
  }, [user])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSave = async e => {
    e.preventDefault()
    try {
      await updateProfileMutation.mutateAsync(form)
      setEdit(false)
    } catch {}
  }

  const handleLogout = async () => {
    await signOut()
    queryClient.clear()
    clearAuthTokens()
    toast.success('Вы вышли из аккаунта')
    navigate('/')
  }

  if (isLoading) return <div className="max-w-2xl mx-auto px-4 py-8 text-gray-500">Загрузка...</div>
  if (!user) return (
    <div className="max-w-2xl mx-auto px-4 py-8 text-center text-gray-400">
      <p className="mb-4">Войдите, чтобы просматривать профиль</p>
      <button className="bg-blue-600 text-white px-6 py-2 rounded-full" onClick={() => navigate('/')}>На главную</button>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Профиль</h1>
        <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-medium transition-colors">
          <LogOut className="w-4 h-4" />
          Выйти
        </button>
      </div>

      {/* Информация об аккаунте */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {user.profile?.display_name || user.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Mail className="w-3.5 h-3.5" />{user.email}
            </div>
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full mt-1 inline-block">
              {USER_ROLE_LABELS[user.role] || user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Форма редактирования профиля */}
      <form className="bg-white rounded-xl shadow-sm border border-gray-100 p-5" onSubmit={handleSave}>
        <h2 className="font-semibold text-gray-900 mb-4">Данные профиля</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Имя</label>
            <input name="firstName" value={form.firstName || ''} onChange={handleChange} disabled={!edit}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 disabled:bg-gray-50 disabled:text-gray-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Фамилия</label>
            <input name="lastName" value={form.lastName || ''} onChange={handleChange} disabled={!edit}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 disabled:bg-gray-50 disabled:text-gray-500" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Отображаемое имя</label>
            <input name="displayName" value={form.displayName || ''} onChange={handleChange} disabled={!edit}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 disabled:bg-gray-50 disabled:text-gray-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1"><Phone className="inline w-3 h-3" /> Телефон</label>
            <input name="phone" value={form.phone || ''} onChange={handleChange} disabled={!edit}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 disabled:bg-gray-50 disabled:text-gray-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1"><Globe className="inline w-3 h-3" /> Веб-сайт</label>
            <input name="websiteUrl" value={form.websiteUrl || ''} onChange={handleChange} disabled={!edit}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 disabled:bg-gray-50 disabled:text-gray-500" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1"><FileText className="inline w-3 h-3" /> О себе</label>
            <textarea name="bio" value={form.bio || ''} onChange={handleChange} disabled={!edit} rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 disabled:bg-gray-50 disabled:text-gray-500 resize-none" />
          </div>
        </div>

        {edit ? (
          <div className="flex gap-3">
            <button type="submit" disabled={updateProfileMutation.isPending}
              className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-50">
              {updateProfileMutation.isPending ? 'Сохраняем...' : 'Сохранить'}
            </button>
            <button type="button" onClick={() => setEdit(false)}
              className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">
              Отмена
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setEdit(true)}
            className="w-full bg-gray-100 text-gray-800 rounded-lg py-2.5 font-semibold text-sm hover:bg-gray-200 transition">
            Редактировать
          </button>
        )}
      </form>
    </div>
  )
}
