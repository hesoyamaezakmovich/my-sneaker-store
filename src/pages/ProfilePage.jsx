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

const fieldClass = `w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm
  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
  disabled:bg-slate-900 disabled:text-slate-600 disabled:cursor-not-allowed transition placeholder-slate-600`

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
        firstName:   user.profile.first_name   || '',
        lastName:    user.profile.last_name    || '',
        displayName: user.profile.display_name || '',
        bio:         user.profile.bio          || '',
        phone:       user.profile.phone        || '',
        websiteUrl:  user.profile.website_url  || '',
      })
    }
  }, [user])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSave = async e => {
    e.preventDefault()
    try { await updateProfileMutation.mutateAsync(form); setEdit(false) } catch {}
  }

  const handleLogout = async () => {
    await signOut()
    queryClient.clear()
    clearAuthTokens()
    toast.success('Вы вышли из аккаунта')
    navigate('/')
  }

  if (isLoading) return (
    <div className="max-w-2xl mx-auto px-4 py-8 text-slate-500">Загрузка...</div>
  )
  if (!user) return (
    <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center text-center text-slate-500">
      <p className="mb-4">Войдите, чтобы просматривать профиль</p>
      <button
        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition"
        style={{ boxShadow: 'none' }}
        onClick={() => navigate('/')}
      >
        На главную
      </button>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Профиль</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-500 hover:text-rose-400 text-sm font-medium transition-colors"
          style={{ boxShadow: 'none' }}
        >
          <LogOut className="w-4 h-4" />
          Выйти
        </button>
      </div>

      {/* Аккаунт */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-500/15 border border-indigo-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 text-indigo-400" />
          </div>
          <div>
            <p className="font-semibold text-white">
              {user.profile?.display_name || user.email}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
              <Mail className="w-3.5 h-3.5" /> {user.email}
            </p>
            <span className="text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-0.5 rounded-full mt-1.5 inline-block">
              {USER_ROLE_LABELS[user.role] || user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Форма */}
      <form className="bg-slate-900 border border-slate-800 rounded-2xl p-5" onSubmit={handleSave}>
        <h2 className="font-semibold text-white mb-4">Данные профиля</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {[
            { name: 'firstName',   label: 'Имя' },
            { name: 'lastName',    label: 'Фамилия' },
          ].map(({ name, label }) => (
            <div key={name}>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
              <input name={name} value={form[name] || ''} onChange={handleChange} disabled={!edit} className={fieldClass} />
            </div>
          ))}

          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Отображаемое имя</label>
            <input name="displayName" value={form.displayName || ''} onChange={handleChange} disabled={!edit} className={fieldClass} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1">
              <Phone className="w-3 h-3" /> Телефон
            </label>
            <input name="phone" value={form.phone || ''} onChange={handleChange} disabled={!edit} className={fieldClass} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1">
              <Globe className="w-3 h-3" /> Веб-сайт
            </label>
            <input name="websiteUrl" value={form.websiteUrl || ''} onChange={handleChange} disabled={!edit} className={fieldClass} />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1">
              <FileText className="w-3 h-3" /> О себе
            </label>
            <textarea name="bio" value={form.bio || ''} onChange={handleChange} disabled={!edit} rows={3} className={`${fieldClass} resize-none`} />
          </div>
        </div>

        {edit ? (
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2.5 font-semibold text-sm transition disabled:opacity-50"
              style={{ boxShadow: 'none' }}
            >
              {updateProfileMutation.isPending ? 'Сохраняем...' : 'Сохранить'}
            </button>
            <button
              type="button"
              onClick={() => setEdit(false)}
              className="px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-sm transition"
              style={{ boxShadow: 'none' }}
            >
              Отмена
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEdit(true)}
            className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-xl py-2.5 font-semibold text-sm transition"
            style={{ boxShadow: 'none' }}
          >
            Редактировать
          </button>
        )}
      </form>
    </div>
  )
}
