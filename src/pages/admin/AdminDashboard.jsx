import React, { useState, useEffect } from 'react'
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  AlertCircle,
  DollarSign,
  BarChart3,
  Activity
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { Link } from 'react-router-dom'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    outOfStock: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    todayOrders: 0,
    todayRevenue: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Загружаем статистику по товарам
      const { data: products } = await supabase
        .from('products')
        .select('*, sizes:product_sizes(*)')
      
      const totalProducts = products?.length || 0
      const outOfStock = products?.filter(p => {
        const totalStock = p.sizes?.reduce((sum, s) => sum + s.quantity, 0) || 0
        return totalStock === 0
      }).length || 0

      // Загружаем товары с низким остатком
      const lowStock = products?.filter(p => {
        const totalStock = p.sizes?.reduce((sum, s) => sum + s.quantity, 0) || 0
        return totalStock > 0 && totalStock <= 5
      }).slice(0, 5) || []
      
      // Загружаем заказы
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
      
      const totalOrders = orders?.length || 0
      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0
      const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0
      
      // Заказы за сегодня
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayOrdersData = orders?.filter(o => new Date(o.created_at) >= today) || []
      const todayOrders = todayOrdersData.length
      const todayRevenue = todayOrdersData.reduce((sum, o) => sum + (o.total_amount || 0), 0)
      
      // Последние заказы
      const recent = orders?.slice(0, 5) || []
      
      // Загружаем пользователей
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      
      setStats({
        totalProducts,
        outOfStock,
        totalOrders,
        pendingOrders,
        totalUsers: usersCount || 0,
        totalRevenue,
        todayOrders,
        todayRevenue
      })
      
      setRecentOrders(recent)
      setLowStockProducts(lowStock)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Всего товаров',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      link: '/admin/products'
    },
    {
      title: 'Нет в наличии',
      value: stats.outOfStock,
      icon: AlertCircle,
      color: 'bg-red-500',
      link: '/admin/products'
    },
    {
      title: 'Заказов',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-green-500',
      link: '/admin/orders'
    },
    {
      title: 'Ожидают обработки',
      value: stats.pendingOrders,
      icon: Activity,
      color: 'bg-yellow-500',
      link: '/admin/orders'
    },
    {
      title: 'Пользователей',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-purple-500',
      link: '/admin/users'
    },
    {
      title: 'Общая выручка',
      value: `${stats.totalRevenue.toLocaleString()} ₽`,
      icon: DollarSign,
      color: 'bg-indigo-500',
      link: '/admin/stats'
    },
    {
      title: 'Заказов сегодня',
      value: stats.todayOrders,
      icon: TrendingUp,
      color: 'bg-pink-500',
      link: '/admin/orders'
    },
    {
      title: 'Выручка сегодня',
      value: `${stats.todayRevenue.toLocaleString()} ₽`,
      icon: BarChart3,
      color: 'bg-teal-500',
      link: '/admin/stats'
    }
  ]

  if (loading) {
    return <div className="text-center py-12">Загрузка...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Панель управления</h1>
      
      {/* Статистические карточки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Link
              key={index}
              to={stat.link}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Последние заказы */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Последние заказы</h2>
          </div>
          <div className="p-6">
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Заказ #{order.order_number}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{order.total_amount} ₽</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'delivered'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">Нет заказов</p>
            )}
            <Link
              to="/admin/orders"
              className="block mt-4 text-center text-sm text-blue-600 hover:text-blue-800"
            >
              Посмотреть все заказы →
            </Link>
          </div>
        </div>

        {/* Товары с низким остатком */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Заканчивающиеся товары</h2>
          </div>
          <div className="p-6">
            {lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {lowStockProducts.map((product) => {
                  const totalStock = product.sizes?.reduce((sum, s) => sum + s.quantity, 0) || 0
                  return (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] && (
                          <img
                            src={product.images[0].image_url}
                            alt={product.name}
                            className="w-10 h-10 rounded object-contain bg-gray-100"
                          />
                        )}
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.sku}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-red-600">
                        Осталось: {totalStock} шт.
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center">Все товары в наличии</p>
            )}
            <Link
              to="/admin/products"
              className="block mt-4 text-center text-sm text-blue-600 hover:text-blue-800"
            >
              Управление товарами →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard