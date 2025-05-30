import React, { useState, useEffect } from 'react'
import { Search, Mail, Phone, MapPin, User, Shield, Ban, Eye } from 'lucide-react'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'
import Modal from '../../components/ui/Modal'

const AdminUsersPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [sortField, setSortField] = useState('created_at')
  const [sortDirection, setSortDirection] = useState('desc')

  useEffect(() => {
    loadUsers()
  }, [sortField, sortDirection])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          orders:orders(count),
          favorites:favorites(count),
          cart_items:cart_items(count)
        `)
        .order(sortField, { ascending: sortDirection === 'asc' })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Ошибка загрузки пользователей')
    } finally {
      setLoading(false)
    }
  }

  const toggleAdminStatus = async (userId, currentIsAdmin) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentIsAdmin })
        .eq('id', userId)

      if (error) throw error

      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_admin: !currentIsAdmin }
          : user
      ))

      toast.success(
        !currentIsAdmin 
          ? 'Пользователь получил права администратора'
          : 'Права администратора отозваны'
      )
    } catch (error) {
      console.error('Error updating admin status:', error)
      toast.error('Ошибка изменения статуса')
    }
  }

  const banUser = async (userId, currentIsBanned) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: !currentIsBanned })
        .eq('id', userId)

      if (error) throw error

      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_banned: !currentIsBanned }
          : user
      ))

      toast.success(
        !currentIsBanned 
          ? 'Пользователь заблокирован'
          : 'Пользователь разблокирован'
      )
    } catch (error) {
      console.error('Error updating ban status:', error)
      toast.error('Ошибка изменения статуса')
    }
  }

  const loadUserDetails = async (userId) => {
    try {
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) throw userError

      // Загружаем заказы пользователя
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (ordersError) throw ordersError

      // Загружаем общую статистику
      const { data: orderStats } = await supabase
        .from('orders')
        .select('total_amount, status')
        .eq('user_id', userId)

      const totalSpent = orderStats?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
      const totalOrders = orderStats?.length || 0

      setSelectedUser({
        ...user,
        orders,
        totalSpent,
        totalOrders
      })
      setIsModalOpen(true)
    } catch (error) {
      console.error('Error loading user details:', error)
      toast.error('Ошибка загрузки данных пользователя')
    }
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Фильтрация пользователей
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase()
    return (
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.includes(searchTerm)
    )
  })

  // Пагинация
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return <div className="text-center py-12">Загрузка...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Управление пользователями</h1>
      </div>

      {/* Поиск */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Поиск по имени, email, телефону..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Всего пользователей</div>
          <div className="text-2xl font-bold">{users.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Администраторы</div>
          <div className="text-2xl font-bold text-blue-600">
            {users.filter(u => u.is_admin).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Заблокированные</div>
          <div className="text-2xl font-bold text-red-600">
            {users.filter(u => u.is_banned).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Новые (месяц)</div>
          <div className="text-2xl font-bold text-green-600">
            {users.filter(u => 
              new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            ).length}
          </div>
        </div>
      </div>

      {/* Таблица пользователей */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('first_name')}
              >
                Пользователь {sortField === 'first_name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Контакты
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('created_at')}
              >
                Дата регистрации {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Заказы
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Не указано'}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 space-y-1">
                    {user.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {user.phone}
                      </div>
                    )}
                    {user.city && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        {user.city}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString('ru-RU')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    {user.is_admin && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Администратор
                      </span>
                    )}
                    {user.is_banned && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <Ban className="w-3 h-3 mr-1" />
                        Заблокирован
                      </span>
                    )}
                    {!user.is_admin && !user.is_banned && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Активен
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.orders?.[0]?.count || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => loadUserDetails(user.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Просмотр профиля"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                      className={`${user.is_admin ? 'text-red-600 hover:text-red-900' : 'text-blue-600 hover:text-blue-900'}`}
                      title={user.is_admin ? 'Отозвать права админа' : 'Сделать администратором'}
                    >
                      <Shield className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => banUser(user.id, user.is_banned)}
                      className={`${user.is_banned ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'}`}
                      title={user.is_banned ? 'Разблокировать' : 'Заблокировать'}
                    >
                      <Ban className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {currentItems.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Пользователи не найдены
          </div>
        )}
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Предыдущая
          </button>
          <span>
            Страница {currentPage} из {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Следующая
          </button>
        </div>
      )}

      {/* Модальное окно с деталями пользователя */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Профиль пользователя"
        size="xl"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* Основная информация */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Личная информация</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Имя:</strong> {selectedUser.first_name || 'Не указано'}</div>
                  <div><strong>Фамилия:</strong> {selectedUser.last_name || 'Не указано'}</div>
                  <div><strong>Email:</strong> {selectedUser.email}</div>
                  <div><strong>Телефон:</strong> {selectedUser.phone || 'Не указан'}</div>
                  <div><strong>Дата рождения:</strong> {selectedUser.birth_date ? new Date(selectedUser.birth_date).toLocaleDateString('ru-RU') : 'Не указана'}</div>
                  <div><strong>Пол:</strong> {selectedUser.gender === 'male' ? 'Мужской' : selectedUser.gender === 'female' ? 'Женский' : 'Не указан'}</div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Адрес</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Город:</strong> {selectedUser.city || 'Не указан'}</div>
                  <div><strong>Адрес:</strong> {selectedUser.address || 'Не указан'}</div>
                  <div><strong>Индекс:</strong> {selectedUser.postal_code || 'Не указан'}</div>
                </div>
              </div>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Всего заказов</div>
                <div className="text-xl font-bold">{selectedUser.totalOrders}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Общая сумма</div>
                <div className="text-xl font-bold">{formatPrice(selectedUser.totalSpent)}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Средний чек</div>
                <div className="text-xl font-bold">
                  {selectedUser.totalOrders > 0 
                    ? formatPrice(selectedUser.totalSpent / selectedUser.totalOrders)
                    : formatPrice(0)
                  }
                </div>
              </div>
            </div>

            {/* Последние заказы */}
            <div>
              <h3 className="font-semibold mb-2">Последние заказы</h3>
              {selectedUser.orders && selectedUser.orders.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Номер</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Дата</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Сумма</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Статус</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedUser.orders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-4 py-2 text-sm">{order.order_number}</td>
                          <td className="px-4 py-2 text-sm">{new Date(order.created_at).toLocaleDateString('ru-RU')}</td>
                          <td className="px-4 py-2 text-sm">{formatPrice(order.total_amount)}</td>
                          <td className="px-4 py-2 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Заказов нет</p>
              )}
            </div>

            {/* Даты */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <strong>Дата регистрации:</strong> {new Date(selectedUser.created_at).toLocaleDateString('ru-RU')}
              </div>
              <div>
                <strong>Последнее обновление:</strong> {new Date(selectedUser.updated_at).toLocaleDateString('ru-RU')}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminUsersPage