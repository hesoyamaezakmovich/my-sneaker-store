import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Calendar,
  Download
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'

const AdminStatsPage = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    avgOrderValue: 0,
    conversionRate: 0
  })
  const [periodStats, setPeriodStats] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [topCategories, setTopCategories] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('7') // дни
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadStats()
  }, [period, dateRange])

  const loadStats = async () => {
    try {
      setLoading(true)
      await Promise.all([
        loadGeneralStats(),
        loadPeriodStats(),
        loadTopProducts(),
        loadTopCategories(),
        loadRecentOrders()
      ])
    } catch (error) {
      console.error('Error loading stats:', error)
      toast.error('Ошибка загрузки статистики')
    } finally {
      setLoading(false)
    }
  }

  const loadGeneralStats = async () => {
    try {
      // Общая статистика
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, status, created_at')

      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
      const totalOrders = orders?.length || 0
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Примерный расчет конверсии (заказы / пользователи * 100)
      const conversionRate = usersCount > 0 ? (totalOrders / usersCount) * 100 : 0

      setStats({
        totalRevenue,
        totalOrders,
        totalUsers: usersCount || 0,
        totalProducts: productsCount || 0,
        avgOrderValue,
        conversionRate
      })
    } catch (error) {
      console.error('Error loading general stats:', error)
    }
  }

  const loadPeriodStats = async () => {
    try {
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end + 'T23:59:59')
        .order('created_at')

      // Группируем по дням
      const groupedByDay = {}
      orders?.forEach(order => {
        const date = order.created_at.split('T')[0]
        if (!groupedByDay[date]) {
          groupedByDay[date] = { revenue: 0, orders: 0 }
        }
        groupedByDay[date].revenue += order.total_amount || 0
        groupedByDay[date].orders += 1
      })

      // Преобразуем в массив
      const periodData = Object.entries(groupedByDay).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders
      }))

      setPeriodStats(periodData)
    } catch (error) {
      console.error('Error loading period stats:', error)
    }
  }

  const loadTopProducts = async () => {
    try {
      const { data } = await supabase
        .from('order_items')
        .select(`
          product_id,
          product_name,
          quantity,
          price,
          product:products(name, sku)
        `)

      // Группируем по товарам
      const productStats = {}
      data?.forEach(item => {
        const id = item.product_id
        if (!productStats[id]) {
          productStats[id] = {
            id,
            name: item.product_name || item.product?.name,
            sku: item.product?.sku,
            quantity: 0,
            revenue: 0
          }
        }
        productStats[id].quantity += item.quantity
        productStats[id].revenue += (item.price * item.quantity)
      })

      // Сортируем по выручке
      const sortedProducts = Object.values(productStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)

      setTopProducts(sortedProducts)
    } catch (error) {
      console.error('Error loading top products:', error)
    }
  }

  const loadTopCategories = async () => {
    try {
      const { data } = await supabase
        .from('order_items')
        .select(`
          product:products(
            category:categories(id, name)
          ),
          quantity,
          price
        `)

      // Группируем по категориям
      const categoryStats = {}
      data?.forEach(item => {
        const category = item.product?.category
        if (category) {
          if (!categoryStats[category.id]) {
            categoryStats[category.id] = {
              id: category.id,
              name: category.name,
              quantity: 0,
              revenue: 0
            }
          }
          categoryStats[category.id].quantity += item.quantity
          categoryStats[category.id].revenue += (item.price * item.quantity)
        }
      })

      // Сортируем по выручке
      const sortedCategories = Object.values(categoryStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

      setTopCategories(sortedCategories)
    } catch (error) {
      console.error('Error loading top categories:', error)
    }
  }

  const loadRecentOrders = async () => {
    try {
      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          profile:profiles(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      setRecentOrders(data || [])
    } catch (error) {
      console.error('Error loading recent orders:', error)
    }
  }

  const exportStats = () => {
    const csvData = [
      ['Метрика', 'Значение'],
      ['Общая выручка', stats.totalRevenue],
      ['Всего заказов', stats.totalOrders],
      ['Пользователей', stats.totalUsers],
      ['Товаров', stats.totalProducts],
      ['Средний чек', stats.avgOrderValue.toFixed(2)],
      ['Конверсия (%)', stats.conversionRate.toFixed(2)],
      [],
      ['Топ товары по выручке'],
      ['Название', 'SKU', 'Количество', 'Выручка'],
      ...topProducts.map(p => [p.name, p.sku, p.quantity, p.revenue])
    ]

    const csv = csvData.map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `stats_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handlePeriodChange = (days) => {
    setPeriod(days)
    setDateRange({
      start: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    })
  }

  if (loading) {
    return <div className="text-center py-12">Загрузка статистики...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Статистика и аналитика</h1>
        <button
          onClick={exportStats}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-5 h-5" />
          Экспорт в CSV
        </button>
      </div>

      {/* Фильтры периода */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4">
          <span className="font-medium">Период:</span>
          <div className="flex gap-2">
            {[
              { label: '7 дней', value: '7' },
              { label: '30 дней', value: '30' },
              { label: '90 дней', value: '90' },
              { label: 'Год', value: '365' }
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => handlePeriodChange(parseInt(value))}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  period === value
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="ml-4 flex items-center gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
            <span>—</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Общая выручка</p>
              <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Всего заказов</p>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Пользователей</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Товаров</p>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Средний чек</p>
              <p className="text-2xl font-bold">{formatPrice(stats.avgOrderValue)}</p>
            </div>
            <div className="p-3 bg-teal-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Конверсия</p>
              <p className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-pink-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-pink-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* График продаж по дням */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Продажи по дням</h2>
          {periodStats.length > 0 ? (
            <div className="space-y-2">
              {periodStats.slice(-10).map((day, index) => (
                <div key={day.date} className="flex items-center justify-between py-2">
                  <div className="text-sm">
                    {new Date(day.date).toLocaleDateString('ru-RU')}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      {day.orders} заказов
                    </div>
                    <div className="font-medium">
                      {formatPrice(day.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Нет данных за выбранный период</p>
          )}
        </div>

        {/* Топ товары */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Топ товары по выручке</h2>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{product.name}</div>
                      <div className="text-xs text-gray-500">
                        Продано: {product.quantity} шт.
                      </div>
                    </div>
                  </div>
                  <div className="font-medium">{formatPrice(product.revenue)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Нет данных</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Топ категории */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Топ категории</h2>
          {topCategories.length > 0 ? (
            <div className="space-y-3">
              {topCategories.map((category, index) => (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-xs text-gray-500">
                        Продано: {category.quantity} шт.
                      </div>
                    </div>
                  </div>
                  <div className="font-medium">{formatPrice(category.revenue)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Нет данных</p>
          )}
        </div>

        {/* Последние заказы */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Последние заказы</h2>
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="font-medium text-sm">#{order.order_number}</div>
                    <div className="text-xs text-gray-500">
                      {`${order.profile?.first_name || ''} ${order.profile?.last_name || ''}`.trim() || 'Гость'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatPrice(order.total_amount)}</div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Нет заказов</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminStatsPage