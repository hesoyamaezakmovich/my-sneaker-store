import React, { useEffect, useState } from 'react'
import { fetchOrdersByUser } from '../../services/orders.service'
import { useUserQuery } from '../../hooks/useUserQuery'
import { useNavigate } from 'react-router-dom'

export default function UserOrdersPreview() {
  const { data: user } = useUserQuery()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    setLoading(true)
    fetchOrdersByUser(user.id)
      .then(data => setOrders(data.slice(0, 3))) // Показываем только 3 последних заказа
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return null
  if (loading) return <div className="mt-8">Загрузка заказов...</div>
  if (orders.length === 0) return <div className="mt-8 text-gray-400">У вас пока нет заказов.</div>

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Мои заказы</h2>
      <div className="bg-white rounded-xl shadow divide-y">
        {orders.map(order => (
          <div key={order.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <div className="text-sm text-gray-500 mb-1">Заказ №{order.order_number}</div>
              <div className="text-base">{new Date(order.created_at).toLocaleString()}</div>
            </div>
            <div className="flex-1" />
            <div className="text-lg font-bold">{order.total_amount?.toLocaleString()} ₽</div>
            <div className="text-sm px-3 py-1 rounded bg-gray-100 font-medium ml-2">{order.status}</div>
          </div>
        ))}
      </div>
      <button
        className="mt-4 bg-black text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-800 transition"
        onClick={() => navigate('/orders')}
      >
        Все заказы
      </button>
    </div>
  )
} 