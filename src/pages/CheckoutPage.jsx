import React, { useState } from 'react'
import { useCartQuery } from '../hooks/useCartQuery'
import { useClearCart } from '../hooks/useCartMutations'
import { createOrder } from '../services/orders.service'
import { useUserQuery } from '../hooks/useUserQuery'
import { useNavigate } from 'react-router-dom'
import { Package, Download, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { data: user, isLoading: authLoading } = useUserQuery()
  const { data: cartItems = [], isLoading: cartLoading } = useCartQuery()
  const clearCartMutation = useClearCart()
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [ordered, setOrdered] = useState(false)

  const total = cartItems.reduce((sum, item) => sum + Number(item.price || 0), 0)
  const freeItems = cartItems.filter(item => item.is_free)
  const paidItems = cartItems.filter(item => !item.is_free)

  const handleSubmit = async e => {
    e.preventDefault()
    if (cartItems.length === 0) return toast.error('Корзина пуста!')
    setSubmitting(true)
    try {
      const { order, confirmation_url } = await createOrder({ notes })
      await clearCartMutation.mutateAsync()

      if (confirmation_url) {
        toast.success('Заказ создан! Переходим к оплате...')
        window.location.href = confirmation_url
      } else {
        setOrdered(true)
        toast.success('Заказ успешно оформлен!')
      }
    } catch (err) {
      toast.error(err.message || 'Ошибка оформления заказа')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || cartLoading) {
    return <div className="max-w-3xl mx-auto px-4 py-8 text-gray-500">Загрузка...</div>
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col items-center justify-center text-gray-400">
        <div className="text-xl mb-2">Войдите, чтобы оформить заказ</div>
        <button
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition"
          onClick={() => navigate('/')}
        >
          На главную
        </button>
      </div>
    )
  }

  if (ordered) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 flex flex-col items-center text-center">
        <ShieldCheck className="w-20 h-20 text-green-500 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Заказ оформлен!</h1>
        <p className="text-gray-500 mb-8">
          {paidItems.length > 0
            ? 'После подтверждения оплаты ссылки для скачивания появятся в разделе «Мои заказы».'
            : 'Ссылки для скачивания доступны в разделе «Мои заказы».'}
        </p>
        <div className="flex gap-4">
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition"
            onClick={() => navigate('/orders')}
          >
            Мои заказы
          </button>
          <button
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-full font-semibold hover:bg-gray-50 transition"
            onClick={() => navigate('/catalog')}
          >
            В каталог
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Оформление заказа</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Форма */}
        <div>
          <form className="bg-white rounded-xl shadow-sm border p-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий (необязательно)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Примечание к заказу..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows={3}
              />
            </div>

            {/* Информация о доставке */}
            <div className="bg-blue-50 rounded-lg p-4 space-y-2 text-sm text-blue-800">
              <div className="flex items-center gap-2 font-semibold">
                <Download className="w-4 h-4" />
                Цифровая доставка
              </div>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Бесплатные модели доступны сразу</li>
                <li>Платные модели — после подтверждения оплаты</li>
                <li>Ссылки действуют 72 часа</li>
                <li>Лицензия генерируется автоматически</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={submitting || cartItems.length === 0}
              className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold text-base hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting ? 'Оформление...' : 'Оформить заказ'}
            </button>
          </form>
        </div>

        {/* Состав заказа */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Состав заказа</h2>

          {cartItems.length === 0 ? (
            <div className="text-gray-400 text-center py-8">Корзина пуста</div>
          ) : (
            <div className="space-y-3">
              {cartItems.map(item => (
                <div key={item.model_id} className="flex items-center gap-3">
                  {item.preview_image_url ? (
                    <img src={item.preview_image_url} alt={item.title} className="w-12 h-12 rounded object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{item.title}</div>
                    <div className="text-xs text-gray-500">{item.author_name || 'Автор'}</div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 flex-shrink-0">
                    {item.is_free ? (
                      <span className="text-green-600">Бесплатно</span>
                    ) : (
                      `${Number(item.price).toLocaleString()} ₽`
                    )}
                  </div>
                </div>
              ))}

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Итого</span>
                  <span className="text-xl font-bold text-gray-900">
                    {total > 0 ? `${total.toLocaleString()} ₽` : 'Бесплатно'}
                  </span>
                </div>
                {freeItems.length > 0 && paidItems.length > 0 && (
                  <div className="text-xs text-gray-400 mt-1">
                    {freeItems.length} бесплатн. + {paidItems.length} платн.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
