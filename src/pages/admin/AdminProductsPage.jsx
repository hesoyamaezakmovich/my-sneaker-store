import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import { deleteModel } from '../../services/models.service'
import api from '../../services/api'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { MODEL_STATUS_LABELS } from '../../utils/constants'

const STATUS_BADGE = {
  draft: 'bg-gray-100 text-gray-600',
  pending_review: 'bg-yellow-100 text-yellow-700',
  published: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  archived: 'bg-gray-100 text-gray-500',
}

const AdminProductsPage = () => {
  const navigate = useNavigate()
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PER_PAGE = 15

  useEffect(() => {
    setLoading(true)
    api.get('/admin/models', { params: { limit: 100 } })
      .then(({ data }) => setModels(data.models || []))
      .catch(() => toast.error('Ошибка загрузки'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить эту модель?')) return
    try {
      await deleteModel(id)
      setModels(prev => prev.filter(m => m.id !== id))
      toast.success('Модель удалена')
    } catch (e) {
      toast.error(e.message)
    }
  }

  const filtered = models.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    (m.author_name || '').toLowerCase().includes(search.toLowerCase())
  )
  const pages = Math.ceil(filtered.length / PER_PAGE)
  const current = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Управление 3D-моделями</h1>
        <button
          onClick={() => navigate('/admin/models/new')}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Добавить модель
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 p-4">
        <input
          type="text"
          placeholder="Поиск по названию или автору..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Модель</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Автор</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Цена</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Статус</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Загрузок</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-48" /></td>
                  <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-24" /></td>
                  <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-16" /></td>
                  <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                  <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-12" /></td>
                  <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-20 ml-auto" /></td>
                </tr>
              ))
            ) : current.map((model) => (
              <tr key={model.id} className="hover:bg-gray-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {model.preview_image_url ? (
                        <img src={model.preview_image_url} alt={model.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg">🧊</span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900 line-clamp-1 max-w-xs">{model.title}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">{model.author_name || model.author_email}</td>
                <td className="px-5 py-4 text-sm font-medium text-gray-900">
                  {model.is_free ? <span className="text-green-600">Бесплатно</span> : `${Number(model.price).toLocaleString()} ₽`}
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_BADGE[model.status] || ''}`}>
                    {MODEL_STATUS_LABELS[model.status]}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">{model.download_count || 0}</td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => navigate(`/model/${model.id}`)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="Просмотр">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => navigate(`/admin/models/${model.id}/edit`)} className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors" title="Редактировать">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(model.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Удалить">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">Модели не найдены</div>
        )}
      </div>

      {pages > 1 && (
        <div className="mt-4 flex justify-center items-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm disabled:opacity-50">← Назад</button>
          <span className="text-sm text-gray-600">{page} / {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm disabled:opacity-50">Вперёд →</button>
        </div>
      )}
    </div>
  )
}

export default AdminProductsPage
