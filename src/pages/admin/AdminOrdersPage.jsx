import React, { useState, useEffect } from 'react'
import { Eye, CheckCircle } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { ORDER_STATUS_LABELS } from '../../utils/constants'

const STATUS_BADGE = {
  pending_payment: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
}

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    api.get('/admin/orders', { params: { status: statusFilter || undefined, limit: 100 } })
      .then(({ data }) => setOrders(data.orders || []))
      .catch(() => toast.error('Ошибка загрузки заказов'))
      .finally(() => setLoading(false))
  }, [statusFilter])

  const handleComplete = async (orderId) => {
    try {
      await api.post(`/orders/${orderId}/complete`)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed' } : o))
      toast.success('Заказ завершён')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка')
    }
  }

  const filtered = orders.filter(o =>
    (o.order_number || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.user_email || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Управление заказами</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Поиск по номеру или email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
        >
          <option value="">Все статусы</option>
          {Object.entries(ORDER_STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Номер</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Пользователь</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Сумма</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Статус</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Дата</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {[...Array(6)].map((__, j) => (
                    <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.map(order => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 text-sm font-mono text-gray-900">#{order.order_number}</td>
                <td className="px-5 py-4 text-sm text-gray-600">{order.user_email}</td>
                <td className="px-5 py-4 text-sm font-semibold text-gray-900">{Number(order.total_amount).toLocaleString()} ₽</td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_BADGE[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {ORDER_STATUS_LABELS[order.status] || order.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString('ru-RU')}
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {order.status === 'paid' && (
                      <button
                        onClick={() => handleComplete(order.id)}
                        className="p-1.5 text-gray-400 hover:text-green-600 transition-colors"
                        title="Завершить"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">Заказы не найдены</div>
        )}
      </div>
    </div>
  )
}

export default AdminOrdersPage
