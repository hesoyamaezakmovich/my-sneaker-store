import React, { useEffect, useState } from 'react'
import { fetchOrders, fetchDownloadLinks } from '../services/orders.service'
import { Package, Download, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUserQuery } from '../hooks/useUserQuery'
import toast from 'react-hot-toast'
import { ORDER_STATUS_LABELS } from '../utils/constants'

const STATUS_BADGE = {
  pending_payment: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  paid:            'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  completed:       'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  cancelled:       'bg-red-500/10 text-red-400 border border-red-500/20',
  refunded:        'bg-slate-700 text-slate-400 border border-slate-600',
}

export default function OrdersPage() {
  const { data: user, isLoading: authLoading } = useUserQuery()
  const [orders, setOrders]               = useState([])
  const [loading, setLoading]             = useState(true)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [downloadLinks, setDownloadLinks] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) { setLoading(false); return }
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
    } catch (e) { toast.error(e.message) }
  }

  if (authLoading || loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-slate-500">Загрузка...</div>
  )

  if (!user) return (
    <div className="max-w-3xl mx-auto px-4 py-16 flex flex-col items-center text-center text-slate-500">
      <Package className="w-14 h-14 mb-4 text-slate-700" />
      <p className="text-lg mb-4">Войдите, чтобы просматривать заказы</p>
      <button
        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition"
        style={{ boxShadow: 'none' }}
        onClick={() => navigate('/')}
      >
        На главную
      </button>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Мои заказы</h1>
        <p className="text-slate-500 text-sm mt-1">История покупок и ссылки для скачивания</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900 border border-slate-800 rounded-2xl text-center">
          <Package className="w-14 h-14 text-slate-700 mb-4" />
          <p className="text-slate-400 font-medium mb-1">У вас пока нет заказов</p>
          <p className="text-slate-600 text-sm mb-6">Перейдите в каталог, чтобы купить 3D-модели</p>
          <button
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition"
            style={{ boxShadow: 'none' }}
            onClick={() => navigate('/catalog')}
          >
            В каталог <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-800/40 transition-colors"
                style={{ boxShadow: 'none' }}
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div>
                  <p className="font-semibold text-white">Заказ №{order.order_number}</p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[order.status] || STATUS_BADGE.refunded}`}>
                    {ORDER_STATUS_LABELS[order.status] || order.status}
                  </span>
                  <p className="font-bold text-white">{Number(order.total_amount).toLocaleString()} ₽</p>
                  {expandedOrder === order.id
                    ? <ChevronUp className="w-4 h-4 text-slate-500" />
                    : <ChevronDown className="w-4 h-4 text-slate-500" />
                  }
                </div>
              </button>

              {expandedOrder === order.id && order.items && (
                <div className="border-t border-slate-800 p-5 space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-700">
                        {item.model_preview_url ? (
                          <img src={item.model_preview_url} alt={item.model_title} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <Package className="w-5 h-5 text-slate-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-white truncate">{item.model_title}</p>
                        {item.license_key && (
                          <p className="text-xs text-slate-600 font-mono mt-0.5">{item.license_key}</p>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-white flex-shrink-0">
                        {Number(item.price) === 0 ? (
                          <span className="text-emerald-400">Бесплатно</span>
                        ) : `${Number(item.price).toLocaleString()} ₽`}
                      </p>
                      {item.license_id && (order.status === 'paid' || order.status === 'completed') && (
                        <button
                          onClick={() => handleGetDownloads(item.license_id)}
                          className="flex items-center gap-1.5 text-xs bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                          style={{ boxShadow: 'none' }}
                        >
                          <Download className="w-3.5 h-3.5" />
                          Скачать
                        </button>
                      )}
                    </div>
                  ))}

                  {Object.entries(downloadLinks)
                    .filter(([licenseId]) => order.items?.some(i => i.license_id === licenseId))
                    .map(([licenseId, files]) => (
                      <div key={licenseId} className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-4 mt-2">
                        <p className="text-xs font-semibold text-indigo-400 mb-2">
                          Ссылки для скачивания (действительны 72 ч):
                        </p>
                        {files.map(file => (
                          <a
                            key={file.file_id}
                            href={file.download_url}
                            download
                            className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 hover:underline mb-1 transition-colors"
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
