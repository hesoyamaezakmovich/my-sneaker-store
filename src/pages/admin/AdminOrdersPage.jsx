import React, { useState, useEffect } from 'react'
import { Eye, Search, Filter, Download, CheckCircle, XCircle, Clock, Truck } from 'lucide-react'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'
import Modal from '../../components/ui/Modal'

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)

  const statusOptions = [
    { value: '', label: 'Все статусы' },
    { value: 'pending', label: 'Ожидает подтверждения' },
    { value: 'processing', label: 'В обработке' },
    { value: 'shipped', label: 'Отправлен' },
    { value: 'delivered', label: 'Доставлен' },
    { value: 'cancelled', label: 'Отменен' }
  ]

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  const statusIcons = {
    pending: Clock,
    processing: Eye,
    shipped: Truck,
    delivered: CheckCircle,
    cancelled: XCircle
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profile:profiles(first_name, last_name, email),
          items:order_items(
            *,
            product:products(name, sku),
            size:sizes(size_value)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error loading orders:', error)
      toast.error('Ошибка загрузки заказов')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) throw error

      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ))

      toast.success('Статус заказа обновлен')
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Ошибка обновления статуса')
    }
  }

  const exportToCSV = () => {
    const headers = ['Номер заказа', 'Дата', 'Клиент', 'Email', 'Телефон', 'Сумма', 'Статус', 'Адрес доставки']
    const rows = filteredOrders.map(order => [
      order.order_number,
      new Date(order.created_at).toLocaleDateString(),
      `${order.profile?.first_name || ''} ${order.profile?.last_name || ''}`.trim(),
      order.email,
      order.phone,
      order.total_amount,
      statusOptions.find(s => s.value === order.status)?.label || order.status,
      `${order.shipping_city}, ${order.shipping_address}`
    ])

    const csv = [headers, ...rows].map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Фильтрация заказов
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone?.includes(searchTerm) ||
      `${order.profile?.first_name || ''} ${order.profile?.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = !statusFilter || order.status === statusFilter

    const matchesDate = !dateFilter || 
      new Date(order.created_at).toISOString().split('T')[0] >= dateFilter

    return matchesSearch && matchesStatus && matchesDate
  })

  // Пагинация
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)

  const openOrderDetails = (order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

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
        <h1 className="text-3xl font-bold">Управление заказами</h1>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-5 h-5" />
          Экспорт в CSV
        </button>
      </div>

      {/* Фильтры */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск по номеру, клиенту, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />

          <button
            onClick={() => {
              setSearchTerm('')
              setStatusFilter('')
              setDateFilter('')
            }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Сбросить
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Всего заказов</div>
          <div className="text-2xl font-bold">{orders.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Ожидают обработки</div>
          <div className="text-2xl font-bold text-yellow-600">
            {orders.filter(o => o.status === 'pending').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">В обработке</div>
          <div className="text-2xl font-bold text-blue-600">
            {orders.filter(o => o.status === 'processing').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Общая сумма</div>
          <div className="text-2xl font-bold">
            {formatPrice(orders.reduce((sum, o) => sum + (o.total_amount || 0), 0))}
          </div>
        </div>
      </div>

      {/* Таблица заказов */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Номер заказа
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Клиент
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Сумма
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((order) => {
              const StatusIcon = statusIcons[order.status] || Clock
              return (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {order.order_number}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {`${order.profile?.first_name || ''} ${order.profile?.last_name || ''}`.trim() || 'Гость'}
                    </div>
                    <div className="text-sm text-gray-500">{order.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatPrice(order.total_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusOptions.find(s => s.value === order.status)?.label || order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openOrderDetails(order)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {currentItems.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Заказы не найдены
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

      {/* Модальное окно с деталями заказа */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Заказ №${selectedOrder?.order_number}`}
        size="xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Информация о клиенте */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Информация о клиенте</h3>
                <div className="space-y-1 text-sm">
                  <div><strong>Имя:</strong> {`${selectedOrder.profile?.first_name || ''} ${selectedOrder.profile?.last_name || ''}`.trim() || 'Не указано'}</div>
                  <div><strong>Email:</strong> {selectedOrder.email}</div>
                  <div><strong>Телефон:</strong> {selectedOrder.phone}</div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Доставка</h3>
                <div className="space-y-1 text-sm">
                  <div><strong>Адрес:</strong> {selectedOrder.shipping_address}</div>
                  <div><strong>Город:</strong> {selectedOrder.shipping_city}</div>
                  <div><strong>Индекс:</strong> {selectedOrder.shipping_postal_code}</div>
                </div>
              </div>
            </div>

            {/* Товары в заказе */}
            <div>
              <h3 className="font-semibold mb-2">Товары</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Товар</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Размер</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Кол-во</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Цена</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Сумма</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedOrder.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2">
                          <div className="font-medium">{item.product_name}</div>
                          <div className="text-sm text-gray-500">{item.product?.sku}</div>
                        </td>
                        <td className="px-4 py-2">{item.size_value}</td>
                        <td className="px-4 py-2">{item.quantity}</td>
                        <td className="px-4 py-2">{formatPrice(item.price)}</td>
                        <td className="px-4 py-2">{formatPrice(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-right mt-2">
                <strong>Итого: {formatPrice(selectedOrder.total_amount)}</strong>
              </div>
            </div>

            {/* Изменение статуса */}
            <div>
              <h3 className="font-semibold mb-2">Статус заказа</h3>
              <div className="flex gap-2">
                {statusOptions.slice(1).map((status) => {
                  const StatusIcon = statusIcons[status.value]
                  return (
                    <button
                      key={status.value}
                      onClick={() => updateOrderStatus(selectedOrder.id, status.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedOrder.status === status.value
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <StatusIcon className="w-4 h-4" />
                      {status.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Комментарии */}
            {selectedOrder.notes && (
              <div>
                <h3 className="font-semibold mb-2">Комментарий к заказу</h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {selectedOrder.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminOrdersPage