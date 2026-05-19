import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Upload, X, Image, Box } from 'lucide-react'
import { fetchModelById, createModel, updateModel, fetchCategories, fetchTags } from '../services/models.service'
import api from '../services/api'
import toast from 'react-hot-toast'
import { LICENSE_TYPE_LABELS } from '../utils/constants'
import { useUserQuery } from '../hooks/useUserQuery'

const AuthorModelEditPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: user } = useUserQuery()
  const isEdit = !!id
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [previewUrl, setPreviewUrl] = useState('')
  const [modelFile, setModelFile] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingModel, setUploadingModel] = useState(false)
  const imageInputRef = useRef()
  const modelInputRef = useRef()
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
    if (user && user.role !== 'author' && user.role !== 'admin') {
      toast.error('Доступ только для авторов')
      navigate('/')
      return
    }

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
          setPreviewUrl(model.preview_image_url || '')
        })
        .finally(() => setLoading(false))
    }
  }, [id, user])

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setPreviewUrl(data.url)
      toast.success('Картинка загружена')
    } catch {
      toast.error('Ошибка загрузки картинки')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleModelUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingModel(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post('/upload/model', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setModelFile({ url: data.url, name: data.originalName, format: data.format })
      toast.success('3D файл загружен')
    } catch {
      toast.error('Ошибка загрузки 3D файла')
    } finally {
      setUploadingModel(false)
    }
  }

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
      const payload = { ...form, previewImageUrl: previewUrl, modelFile }
      if (isEdit) {
        await updateModel(id, payload)
        toast.success('Модель обновлена')
      } else {
        await createModel(payload)
        toast.success('Модель создана')
      }
      navigate('/author')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-slate-800 rounded w-32" />
        <div className="h-8 bg-slate-800 rounded w-56" />
        <div className="h-64 bg-slate-800/60 rounded-xl" />
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/author')} className="flex items-center gap-2 text-slate-500 hover:text-slate-300 mb-6 text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Назад в кабинет
      </button>

      <h1 className="text-2xl font-bold mb-6 text-white">{isEdit ? 'Редактировать модель' : 'Добавить модель'}</h1>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Название *</label>
            <input value={form.title} onChange={e => handleChange('title', e.target.value)} required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Описание</label>
            <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} rows={4}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Цена (₽)</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={e => handleChange('price', e.target.value)}
                disabled={form.isFree}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFree} onChange={e => handleChange('isFree', e.target.checked)}
                  className="rounded border-slate-600" />
                <span className="text-sm text-slate-300">Бесплатная модель</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Категория</label>
              <select value={form.categoryId} onChange={e => handleChange('categoryId', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                <option value="">Без категории</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Лицензия</label>
              <select value={form.licenseType} onChange={e => handleChange('licenseType', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                {Object.entries(LICENSE_TYPE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Кол-во полигонов</label>
              <input type="number" min="0" value={form.polygonCount} onChange={e => handleChange('polygonCount', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Программа</label>
              <input value={form.softwareUsed} onChange={e => handleChange('softwareUsed', e.target.value)}
                placeholder="Blender, 3ds Max..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          {tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Теги</label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button key={tag.id} type="button" onClick={() => handleTagToggle(tag.id)}
                    className={`text-xs px-3 py-1 rounded-full transition-colors ${
                      form.tags.includes(tag.id) ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}>
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300">Файлы</h3>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Превью картинка</label>
            <div className="flex items-start gap-4">
              {previewUrl ? (
                <div className="relative">
                  <img src={previewUrl} alt="preview" className="w-24 h-24 rounded-lg object-cover border border-slate-700" />
                  <button type="button" onClick={() => setPreviewUrl('')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center">
                  <Image className="w-8 h-8 text-slate-600" />
                </div>
              )}
              <div>
                <input ref={imageInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleImageUpload} />
                <button type="button" onClick={() => imageInputRef.current.click()}
                  disabled={uploadingImage}
                  className="flex items-center gap-2 text-sm border border-slate-700 text-slate-300 rounded-lg px-3 py-2 hover:bg-slate-800 disabled:opacity-50 transition-colors">
                  <Upload className="w-4 h-4" />
                  {uploadingImage ? 'Загрузка...' : 'Загрузить картинку'}
                </button>
                <p className="text-xs text-slate-600 mt-1">JPG, PNG, WebP до 100MB</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">3D файл <span className="text-slate-500 font-normal">(необязательно)</span></label>
            <div className="flex items-center gap-4">
              {modelFile ? (
                <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2 text-sm">
                  <Box className="w-4 h-4 text-indigo-400" />
                  <span className="text-slate-300">{modelFile.name}</span>
                  <span className="text-xs text-slate-500">{modelFile.format}</span>
                  <button type="button" onClick={() => setModelFile(null)}>
                    <X className="w-4 h-4 text-slate-500 hover:text-red-400" />
                  </button>
                </div>
              ) : null}
              <div>
                <input ref={modelInputRef} type="file" accept=".fbx,.obj,.glb,.gltf,.stl,.blend,.zip" className="hidden" onChange={handleModelUpload} />
                <button type="button" onClick={() => modelInputRef.current.click()}
                  disabled={uploadingModel}
                  className="flex items-center gap-2 text-sm border border-slate-700 text-slate-300 rounded-lg px-3 py-2 hover:bg-slate-800 disabled:opacity-50 transition-colors">
                  <Upload className="w-4 h-4" />
                  {uploadingModel ? 'Загрузка...' : (modelFile ? 'Заменить файл' : 'Загрузить 3D файл')}
                </button>
                <p className="text-xs text-slate-600 mt-1">FBX, OBJ, GLB, GLTF, STL, Blend, ZIP</p>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50">
          <Save className="w-4 h-4" />
          {saving ? 'Сохраняем...' : (isEdit ? 'Сохранить изменения' : 'Создать модель')}
        </button>
      </form>
    </div>
  )
}

export default AuthorModelEditPage
