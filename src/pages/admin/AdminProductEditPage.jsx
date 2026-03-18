import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { fetchModelById, createModel, updateModel, fetchCategories, fetchTags } from '../../services/models.service'
import toast from 'react-hot-toast'
import { MODEL_FORMATS, LICENSE_TYPES, LICENSE_TYPE_LABELS } from '../../utils/constants'

const AdminProductEditPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: '',
    isFree: false,
    licenseType: 'standard',
    polygonCount: '',
    softwareUsed: '',
    tags: [],
    status: 'draft',
  })

  useEffect(() => {
    Promise.all([fetchCategories(), fetchTags()])
      .then(([cats, tgs]) => { setCategories(cats || []); setTags(tgs || []) })
      .catch(() => {})

    if (isEdit) {
      fetchModelById(id)
        .then(model => {
          setForm({
            title: model.title || '',
            description: model.description || '',
            price: model.price || '',
            categoryId: model.category_id || '',
            isFree: model.is_free || false,
            licenseType: model.license_type || 'standard',
            polygonCount: model.polygon_count || '',
            softwareUsed: model.software_used || '',
            tags: model.tags?.map(t => t.id) || [],
            status: model.status || 'draft',
          })
        })
        .finally(() => setLoading(false))
    }
  }, [id])

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleTagToggle = (tagId) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId) ? prev.tags.filter(t => t !== tagId) : [...prev.tags, tagId],
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title) { toast.error('Введите название'); return }
    setSaving(true)
    try {
      if (isEdit) {
        await updateModel(id, form)
        toast.success('Модель обновлена')
      } else {
        await createModel(form)
        toast.success('Модель создана')
      }
      navigate('/admin/models')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-gray-500">Загрузка...</div>

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate('/admin/models')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Назад к списку
      </button>

      <h1 className="text-2xl font-bold mb-6 text-gray-900">{isEdit ? 'Редактировать модель' : 'Добавить модель'}</h1>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
            <input value={form.title} onChange={e => handleChange('title', e.target.value)} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Цена (₽)</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={e => handleChange('price', e.target.value)}
                disabled={form.isFree}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 disabled:bg-gray-50" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFree} onChange={e => handleChange('isFree', e.target.checked)}
                  className="rounded border-gray-300" />
                <span className="text-sm text-gray-700">Бесплатная модель</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
              <select value={form.categoryId} onChange={e => handleChange('categoryId', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                <option value="">Без категории</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Лицензия</label>
              <select value={form.licenseType} onChange={e => handleChange('licenseType', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                {Object.entries(LICENSE_TYPE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Кол-во полигонов</label>
              <input type="number" min="0" value={form.polygonCount} onChange={e => handleChange('polygonCount', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Программа</label>
              <input value={form.softwareUsed} onChange={e => handleChange('softwareUsed', e.target.value)}
                placeholder="Blender, 3ds Max..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Теги</label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button key={tag.id} type="button" onClick={() => handleTagToggle(tag.id)}
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${
                    form.tags.includes(tag.id) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
              <select value={form.status} onChange={e => handleChange('status', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                <option value="draft">Черновик</option>
                <option value="pending_review">На проверке</option>
                <option value="published">Опубликована</option>
                <option value="rejected">Отклонена</option>
                <option value="archived">В архиве</option>
              </select>
            </div>
          )}
        </div>

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50">
          <Save className="w-4 h-4" />
          {saving ? 'Сохраняем...' : (isEdit ? 'Сохранить изменения' : 'Создать модель')}
        </button>
      </form>
    </div>
  )
}

export default AdminProductEditPage
