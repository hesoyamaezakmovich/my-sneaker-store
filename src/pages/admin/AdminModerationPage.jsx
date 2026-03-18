import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Button from '../../components/ui/Button'
import { CheckCircle, XCircle, Eye, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const AdminModerationPage = () => {
  const navigate = useNavigate()
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [rejectReason, setRejectReason] = useState({})

  useEffect(() => {
    setLoading(true)
    api.get('/admin/moderation')
      .then(({ data }) => setModels(data.models || []))
      .catch(() => toast.error('Ошибка загрузки очереди'))
      .finally(() => setLoading(false))
  }, [])

  const handleApprove = async (modelId) => {
    try {
      await api.post(`/admin/moderation/${modelId}/approve`)
      setModels(prev => prev.filter(m => m.id !== modelId))
      toast.success('Модель опубликована')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка')
    }
  }

  const handleReject = async (modelId) => {
    const reason = rejectReason[modelId]
    if (!reason?.trim()) {
      toast.error('Укажите причину отклонения')
      return
    }
    try {
      await api.post(`/admin/moderation/${modelId}/reject`, { reason })
      setModels(prev => prev.filter(m => m.id !== modelId))
      toast.success('Модель отклонена')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка')
    }
  }

  if (loading) return <div className="p-8 text-gray-500">Загрузка очереди модерации...</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Clock className="w-6 h-6 text-yellow-500" />
        <h1 className="text-2xl font-bold text-gray-900">Очередь модерации</h1>
        <span className="bg-yellow-100 text-yellow-700 text-sm font-semibold px-2 py-0.5 rounded-full">
          {models.length}
        </span>
      </div>

      {models.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="font-medium">Очередь пуста — все модели проверены!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {models.map((model) => (
            <div key={model.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{model.title}</h3>
                  <p className="text-sm text-gray-500">
                    Автор: {model.author_name || model.author_email}
                    <span className="mx-2">·</span>
                    {new Date(model.created_at).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/model/${model.id}`)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <Eye className="w-4 h-4" />
                  Просмотр
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Причина отклонения (обязательно при отклонении)"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  value={rejectReason[model.id] || ''}
                  onChange={e => setRejectReason(prev => ({ ...prev, [model.id]: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => handleApprove(model.id)}
                    className="flex items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Одобрить
                  </Button>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => handleReject(model.id)}
                    className="flex items-center gap-1"
                  >
                    <XCircle className="w-4 h-4" />
                    Отклонить
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminModerationPage
