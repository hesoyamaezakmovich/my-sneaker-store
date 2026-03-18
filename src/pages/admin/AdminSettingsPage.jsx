import React, { useState, useEffect } from 'react'
import { Save, Settings } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/admin/settings')
      .then(({ data }) => setSettings(data.settings || {}))
      .catch(() => toast.error('Ошибка загрузки настроек'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch('/admin/settings', settings)
      toast.success('Настройки сохранены')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key, value) => setSettings(prev => ({ ...prev, [key]: value }))

  if (loading) return <div className="text-gray-500">Загрузка настроек...</div>

  const fields = [
    { key: 'site_name', label: 'Название сайта', type: 'text' },
    { key: 'site_description', label: 'Описание сайта', type: 'text' },
    { key: 'currency', label: 'Валюта', type: 'text' },
    { key: 'commission_rate', label: 'Комиссия с авторов (%)', type: 'number' },
    { key: 'max_file_size_mb', label: 'Макс. размер файла модели (МБ)', type: 'number' },
    { key: 'max_preview_size_mb', label: 'Макс. размер превью (МБ)', type: 'number' },
    { key: 'download_link_ttl_hours', label: 'Время жизни ссылки скачивания (часов)', type: 'number' },
    { key: 'primary_color', label: 'Основной цвет', type: 'color' },
  ]

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-6 h-6 text-gray-600" />
        <h1 className="text-2xl font-bold text-gray-900">Настройки платформы</h1>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          {fields.map(field => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <input
                type={field.type}
                value={settings[field.key] || ''}
                onChange={e => handleChange(field.key, e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
          ))}

          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.moderation_required === 'true'}
                onChange={e => handleChange('moderation_required', e.target.checked ? 'true' : 'false')}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Требовать модерацию перед публикацией</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-4 flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Сохраняем...' : 'Сохранить настройки'}
        </button>
      </form>
    </div>
  )
}

export default AdminSettingsPage
