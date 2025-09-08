import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings,
  Home,
  LogOut,
  Tags,
  Truck,
  MessageCircle
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const AdminLayout = () => {
  const location = useLocation()
  const { signOut } = useAuth()

  const navigation = [
    { name: 'Главная', href: '/admin', icon: Home },
    { name: 'Товары', href: '/admin/products', icon: Package },
    { name: 'Заказы', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Пользователи', href: '/admin/users', icon: Users },
    { name: 'Категории', href: '/admin/categories', icon: Tags },
    { name: 'Доставка', href: '/admin/delivery', icon: Truck },
    { name: 'Поддержка', href: '/admin/support', icon: MessageCircle },
    { name: 'Статистика', href: '/admin/stats', icon: BarChart3 },
    { name: 'Настройки', href: '/admin/settings', icon: Settings },
  ]

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/'
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg">
          <div className="h-full flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b">
              <h1 className="text-2xl font-bold">
                Admin Panel
              </h1>
              <p className="text-sm text-gray-500 mt-1">BRO'S SHOP</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6">
              <ul className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                          isActive(item.href)
                            ? 'bg-black text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t">
              <Link
                to="/"
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                <Home className="w-5 h-5" />
                На сайт
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors w-full mt-2"
              >
                <LogOut className="w-5 h-5" />
                Выйти
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout