import React, { useEffect, useState } from 'react'
import { fetchOrders } from '../../services/orders.service'
import { useUserQuery } from '../../hooks/useUserQuery'
import { useNavigate } from 'react-router-dom'
import { ORDER_STATUS_LABELS } from '../../utils/constants'

export default function UserOrdersPreview() {
  const { data: user } = useUserQuery()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    setLoading(true)
    fetchOrders()
      .then(data => setOrders(data.slice(0, 3)))
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return null
  if (loading) return <div className="mt-6 text-gray-500 text-sm">Загрузка заказов...</div>
  if (orders.length === 0) return <div className="mt-6 text-gray-400 text-sm">У вас пока нет заказов.</div>

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold mb-3 text-gray-900">Последние заказы</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y">
        {orders.map(order => (
          <div key={order.id} className="p-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-gray-900">№{order.order_number}</div>
              <div className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('ru-RU')}</div>
            </div>
            <div className="text-base font-bold text-gray-900">{Number(order.total_amount).toLocaleString()} ₽</div>
            <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
              {ORDER_STATUS_LABELS[order.status] || order.status}
            </div>
          </div>
        ))}
      </div>
      <button
        className="mt-3 text-sm text-blue-600 hover:underline font-medium"
        onClick={() => navigate('/orders')}
      >
        Все заказы →
      </button>
    </div>
  )
}
