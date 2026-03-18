import React, { useState, useEffect } from 'react'
import { Package, ShoppingCart, Users, TrendingUp, DollarSign, BarChart3, Clock } from 'lucide-react'
import api from '../../services/api'
import { Link } from 'react-router-dom'
import { ORDER_STATUS_LABELS } from '../../utils/constants'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-12 text-gray-500">Загрузка...</div>

  const statCards = [
    { title: 'Пользователей', value: stats?.stats.totalUsers || 0, icon: Users, color: 'bg-purple-500', link: '/admin/users' },
    { title: 'Моделей опубликовано', value: stats?.stats.publishedModels || 0, icon: Package, color: 'bg-blue-500', link: '/admin/models' },
    { title: 'Заказов оплачено', value: stats?.stats.paidOrders || 0, icon: ShoppingCart, color: 'bg-green-500', link: '/admin/orders' },
    { title: 'Общая выручка', value: `${Number(stats?.stats.totalRevenue || 0).toLocaleString()} ₽`, icon: DollarSign, color: 'bg-indigo-500', link: '/admin/stats' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8 text-gray-900">Панель управления</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} to={stat.link} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Последние заказы */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Последние заказы</h2>
            <Link to="/admin/orders" className="text-sm text-blue-600 hover:underline">Все →</Link>
          </div>
          <div className="p-5">
            {stats?.recentOrders?.length > 0 ? (
              <div className="space-y-3">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">#{order.order_number}</p>
                      <p className="text-xs text-gray-400">{order.user_email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{Number(order.total_amount).toLocaleString()} ₽</p>
                      <span className="text-xs text-gray-500">{ORDER_STATUS_LABELS[order.status] || order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center text-sm">Нет заказов</p>
            )}
          </div>
        </div>

        {/* Топ моделей */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Топ моделей</h2>
            <Link to="/admin/models" className="text-sm text-blue-600 hover:underline">Все →</Link>
          </div>
          <div className="p-5">
            {stats?.topModels?.length > 0 ? (
              <div className="space-y-3">
                {stats.topModels.map((model, i) => (
                  <div key={model.id} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{model.title}</p>
                      <p className="text-xs text-gray-400">{model.author_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{model.download_count} загрузок</p>
                      <p className="text-xs font-semibold">{Number(model.price).toLocaleString()} ₽</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center text-sm">Нет данных</p>
            )}
          </div>
        </div>
      </div>

      {/* Ссылка на модерацию */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-800">Есть модели, ожидающие модерации</span>
        </div>
        <Link to="/admin/moderation" className="text-sm text-yellow-700 font-semibold hover:underline">
          Перейти к очереди →
        </Link>
      </div>
    </div>
  )
}

export default AdminDashboard
