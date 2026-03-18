import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { USER_ROLE_LABELS } from '../../utils/constants'

const AdminUsersPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  useEffect(() => {
    setLoading(true)
    api.get('/admin/users', { params: { limit: 200, role: roleFilter || undefined } })
      .then(({ data }) => setUsers(data.users || []))
      .catch(() => toast.error('Ошибка загрузки пользователей'))
      .finally(() => setLoading(false))
  }, [roleFilter])

  const handleToggleActive = async (userId, currentActive) => {
    try {
      await api.patch(`/admin/users/${userId}`, { isActive: !currentActive })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !currentActive } : u))
      toast.success(!currentActive ? 'Пользователь активирован' : 'Пользователь заблокирован')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка')
    }
  }

  const handleChangeRole = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}`, { role: newRole })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
      toast.success('Роль обновлена')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка')
    }
  }

  const filtered = users.filter(u =>
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.display_name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Управление пользователями</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Поиск по email или имени..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Все роли</option>
          {Object.entries(USER_ROLE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Пользователь</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Роль</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Статус</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Дата регистрации</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {[...Array(5)].map((__, j) => (
                    <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-5 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || '—'}
                  </div>
                  <div className="text-xs text-gray-400">{user.email}</div>
                </td>
                <td className="px-5 py-4">
                  <select
                    value={user.role}
                    onChange={e => handleChangeRole(user.id, e.target.value)}
                    className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none"
                  >
                    {Object.entries(USER_ROLE_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {user.is_active ? 'Активен' : 'Заблокирован'}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString('ru-RU')}
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => handleToggleActive(user.id, user.is_active)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      user.is_active
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {user.is_active ? 'Заблокировать' : 'Разблокировать'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">Пользователи не найдены</div>
        )}
      </div>
    </div>
  )
}

export default AdminUsersPage
