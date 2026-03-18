import React, { useEffect, useState } from 'react'
import { fetchOrders, fetchDownloadLinks } from '../services/orders.service'
import { Package, Download, ChevronDown, ChevronUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUserQuery } from '../hooks/useUserQuery'
import toast from 'react-hot-toast'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../utils/constants'

const STATUS_BADGE = {
  pending_payment: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
}

export default function OrdersPage() {
  const { data: user, isLoading: authLoading } = useUserQuery()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [downloadLinks, setDownloadLinks] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    fetchOrders()
      .then(setOrders)
      .catch(() => toast.error('Ошибка загрузки заказов'))
      .finally(() => setLoading(false))
  }, [user])

  const handleGetDownloads = async (licenseId) => {
    if (downloadLinks[licenseId]) return
    try {
      const files = await fetchDownloadLinks(licenseId)
      setDownloadLinks(prev => ({ ...prev, [licenseId]: files }))
    } catch (e) {
      toast.error(e.message)
    }
  }

  if (authLoading || loading) return <div className="max-w-3xl mx-auto px-4 py-8 text-gray-500">Загрузка...</div>

  if (!user) return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col items-center justify-center text-gray-400">
      <Package className="w-16 h-16 mb-4" />
      <div className="text-xl mb-2">Войдите, чтобы просматривать заказы</div>
      <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition" onClick={() => navigate('/')}>
        На главную
      </button>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Мои заказы</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Package className="w-16 h-16 mb-4" />
          <div className="text-xl mb-2">У вас пока нет заказов</div>
          <button
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition"
            onClick={() => navigate('/catalog')}
          >
            В каталог
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Заголовок заказа */}
              <button
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div>
                  <div className="font-semibold text-gray-900">Заказ №{order.order_number}</div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {ORDER_STATUS_LABELS[order.status] || order.status}
                  </span>
                  <div className="font-bold text-gray-900">{Number(order.total_amount).toLocaleString()} ₽</div>
                  {expandedOrder === order.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              {/* Позиции заказа */}
              {expandedOrder === order.id && order.items && (
                <div className="border-t border-gray-100 p-5 space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.model_preview_url ? (
                          <img src={item.model_preview_url} alt={item.model_title} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-xl">🧊</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">{item.model_title}</div>
                        {item.license_key && (
                          <div className="text-xs text-gray-400 font-mono">{item.license_key}</div>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {Number(item.price) === 0 ? 'Бесплатно' : `${Number(item.price).toLocaleString()} ₽`}
                      </div>
                      {item.license_id && (order.status === 'paid' || order.status === 'completed') && (
                        <button
                          onClick={() => handleGetDownloads(item.license_id)}
                          className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Скачать
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Ссылки для скачивания */}
                  {Object.entries(downloadLinks).filter(([licenseId]) => order.items?.some(i => i.license_id === licenseId)).map(([licenseId, files]) => (
                    <div key={licenseId} className="bg-blue-50 rounded-lg p-3 mt-2">
                      <div className="text-xs font-semibold text-blue-700 mb-2">Ссылки для скачивания (действительны 72 ч):</div>
                      {files.map((file) => (
                        <a
                          key={file.file_id}
                          href={file.download_url}
                          download
                          className="flex items-center gap-2 text-xs text-blue-600 hover:underline mb-1"
                        >
                          <Download className="w-3 h-3" />
                          {file.file_name} ({file.file_format})
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
