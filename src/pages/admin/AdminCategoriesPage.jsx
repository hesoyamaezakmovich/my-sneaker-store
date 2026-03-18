import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [newCat, setNewCat] = useState({ name: '', slug: '', description: '' })
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    api.get('/models/meta/categories')
      .then(({ data }) => setCategories(data.categories || []))
      .catch(() => toast.error('Ошибка загрузки категорий'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-gray-500">Загрузка...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Категории моделей</h1>
        <button onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Добавить
        </button>
      </div>

      {showAdd && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-blue-700 mb-2">Для добавления категорий используйте базу данных или SQL-миграцию.</p>
          <p className="text-xs text-blue-500">Функция добавления категорий через API будет добавлена в следующей версии.</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Название</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Slug</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Описание</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Порядок</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {categories.map(cat => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 text-sm font-medium text-gray-900">{cat.name}</td>
                <td className="px-5 py-4 text-xs text-gray-400 font-mono">{cat.slug}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{cat.description || '—'}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{cat.sort_order}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">Нет категорий</div>}
      </div>
    </div>
  )
}

export default AdminCategoriesPage
