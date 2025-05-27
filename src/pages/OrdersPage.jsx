import React, { useEffect, useState } from 'react'
import { fetchOrdersByUser } from '../services/orders.service'
import { Package } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      setOrders([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    fetchOrdersByUser(user.id)
      .then(setOrders)
      .catch(() => setError('Ошибка загрузки заказов'))
      .finally(() => setLoading(false))
  }, [user])

  const handleDetails = (order) => {
    toast(`Детали заказа: №${order.order_number}`)
  }

  if (authLoading) return <div className="max-w-3xl mx-auto px-4 py-8">Загрузка...</div>
  if (!user) return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col items-center justify-center text-gray-400">
      <Package className="w-16 h-16 mb-4" />
      <div className="text-xl mb-2">Войдите, чтобы просматривать заказы</div>
      <button className="mt-4 bg-black text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-800 transition" onClick={() => navigate('/')}>На главную</button>
    </div>
  )

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8">Загрузка...</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Мои заказы</h1>
      {error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Package className="w-16 h-16 mb-4" />
          <div className="text-xl mb-2">У вас пока нет заказов</div>
          <button className="mt-4 bg-black text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-800 transition" onClick={() => navigate('/catalog')}>
            Перейти в каталог
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow divide-y">
          {orders.map(order => (
            <div key={order.id} className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Заказ №{order.order_number}</div>
                <div className="text-base font-semibold">{new Date(order.created_at).toLocaleString()}</div>
              </div>
              <div className="flex-1" />
              <div className="text-lg font-bold">{order.total_amount?.toLocaleString()} ₽</div>
              <div className="text-sm px-3 py-1 rounded bg-gray-100 font-medium ml-2">{order.status}</div>
              <button
                className="ml-4 text-blue-600 hover:underline"
                onClick={() => handleDetails(order)}
              >
                Подробнее
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
