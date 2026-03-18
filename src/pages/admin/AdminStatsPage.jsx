import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Users, Package } from 'lucide-react'
import api from '../../services/api'

const AdminStatsPage = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-gray-500">Загрузка статистики...</div>

  const cards = [
    { title: 'Всего пользователей', value: stats?.stats.totalUsers || 0, icon: Users, color: 'text-purple-600 bg-purple-50' },
    { title: 'Опубликованных моделей', value: stats?.stats.publishedModels || 0, icon: Package, color: 'text-blue-600 bg-blue-50' },
    { title: 'Оплаченных заказов', value: stats?.stats.paidOrders || 0, icon: ShoppingCart, color: 'text-green-600 bg-green-50' },
    { title: 'Общая выручка', value: `${Number(stats?.stats.totalRevenue || 0).toLocaleString()} ₽`, icon: DollarSign, color: 'text-indigo-600 bg-indigo-50' },
  ]

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <BarChart3 className="w-6 h-6 text-gray-600" />
        <h1 className="text-2xl font-bold text-gray-900">Статистика</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
              <div className="text-sm text-gray-500 mt-1">{card.title}</div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Топ 5 моделей по загрузкам
        </h2>
        {stats?.topModels?.length > 0 ? (
          <div className="space-y-3">
            {stats.topModels.map((model, i) => (
              <div key={model.id} className="flex items-center gap-4">
                <span className="text-2xl font-bold text-gray-200 w-8 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{model.title}</div>
                  <div className="text-xs text-gray-400">{model.author_name}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-semibold text-gray-900">{model.download_count} загрузок</div>
                  <div className="text-xs text-gray-400">{Number(model.price).toLocaleString()} ₽</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Нет данных</p>
        )}
      </div>
    </div>
  )
}

export default AdminStatsPage
