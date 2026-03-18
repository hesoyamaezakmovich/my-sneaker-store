import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUserQuery } from '../hooks/useUserQuery'
import { fetchAuthorModels, deleteModel, updateModel } from '../services/models.service'
import Button from '../components/ui/Button'
import { Plus, Edit, Trash2, Eye, Download, Star, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { MODEL_STATUS_LABELS } from '../utils/constants'
import toast from 'react-hot-toast'

const STATUS_ICONS = {
  draft: <Clock className="w-4 h-4 text-gray-400" />,
  pending_review: <AlertCircle className="w-4 h-4 text-yellow-500" />,
  published: <CheckCircle className="w-4 h-4 text-green-500" />,
  rejected: <XCircle className="w-4 h-4 text-red-500" />,
  archived: <Clock className="w-4 h-4 text-gray-300" />,
}

const AuthorCabinetPage = () => {
  const { data: user } = useUserQuery()
  const navigate = useNavigate()
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    if (user.role !== 'author' && user.role !== 'admin') {
      toast.error('Доступ только для авторов')
      navigate('/')
      return
    }
    setLoading(true)
    fetchAuthorModels(user.id)
      .then(setModels)
      .catch(() => toast.error('Ошибка загрузки моделей'))
      .finally(() => setLoading(false))
  }, [user])

  const handleDelete = async (modelId) => {
    if (!confirm('Удалить модель? Это действие необратимо.')) return
    try {
      await deleteModel(modelId)
      setModels(prev => prev.filter(m => m.id !== modelId))
      toast.success('Модель удалена')
    } catch (e) {
      toast.error(e.message)
    }
  }

  const handleSubmitForReview = async (modelId) => {
    try {
      await updateModel(modelId, { status: 'pending_review' })
      setModels(prev => prev.map(m => m.id === modelId ? { ...m, status: 'pending_review' } : m))
      toast.success('Модель отправлена на модерацию')
    } catch (e) {
      toast.error(e.message)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-100 rounded w-72" />
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Кабинет автора</h1>
          <p className="text-gray-500 mt-1">
            Привет, {user?.profile?.display_name || user?.email}! Управляйте своими 3D-моделями.
          </p>
        </div>
        <Button as={Link} to="/author/models/new" variant="primary" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Добавить модель
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Всего моделей', value: models.length },
          { label: 'Опубликовано', value: models.filter(m => m.status === 'published').length },
          { label: 'На проверке', value: models.filter(m => m.status === 'pending_review').length },
          { label: 'Загрузок', value: models.reduce((s, m) => s + (m.download_count || 0), 0) },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Список моделей */}
      {models.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="text-5xl mb-4">🧊</div>
          <p className="text-gray-500 mb-4">У вас ещё нет 3D-моделей</p>
          <Button as={Link} to="/author/models/new" variant="primary">
            Загрузить первую модель
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {models.map((model) => (
            <div key={model.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
              {/* Превью */}
              <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                {model.preview_image_url ? (
                  <img src={model.preview_image_url} alt={model.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">🧊</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{model.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                    {STATUS_ICONS[model.status]}
                    {MODEL_STATUS_LABELS[model.status]}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Download className="w-3 h-3" />{model.download_count || 0}</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" />{Number(model.rating_avg || 0).toFixed(1)}</span>
                  <span>{Number(model.price || 0).toLocaleString()} ₽</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {model.status === 'published' && (
                  <button
                    onClick={() => navigate(`/model/${model.id}`)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Просмотр"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
                {model.status === 'draft' && (
                  <button
                    onClick={() => handleSubmitForReview(model.id)}
                    className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    Отправить на проверку
                  </button>
                )}
                <button
                  onClick={() => navigate(`/author/models/${model.id}/edit`)}
                  className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
                  title="Редактировать"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(model.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Удалить"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AuthorCabinetPage
