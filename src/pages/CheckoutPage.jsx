import React, { useState } from 'react'
import { Package, Download, ShieldCheck, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCartQuery } from '../hooks/useCartQuery'
import { useClearCart } from '../hooks/useCartMutations'
import { createOrder } from '../services/orders.service'
import { useUserQuery } from '../hooks/useUserQuery'
import toast from 'react-hot-toast'

const fieldClass = `w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm
  placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { data: user, isLoading: authLoading } = useUserQuery()
  const { data: cartItems = [], isLoading: cartLoading } = useCartQuery()
  const clearCartMutation = useClearCart()
  const [notes, setNotes]         = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [ordered, setOrdered]     = useState(false)

  const total     = cartItems.reduce((sum, item) => sum + Number(item.price || 0), 0)
  const freeItems = cartItems.filter(item => item.is_free)
  const paidItems = cartItems.filter(item => !item.is_free)

  const handleSubmit = async e => {
    e.preventDefault()
    if (cartItems.length === 0) return toast.error('Корзина пуста!')
    setSubmitting(true)
    try {
      const { confirmation_url } = await createOrder({ notes })
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

  if (authLoading || cartLoading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-slate-500">Загрузка...</div>
  )

  if (!user) return (
    <div className="max-w-3xl mx-auto px-4 py-16 flex flex-col items-center text-center text-slate-500">
      <p className="text-lg mb-4">Войдите, чтобы оформить заказ</p>
      <button
        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition"
        style={{ boxShadow: 'none' }}
        onClick={() => navigate('/')}
      >
        На главную
      </button>
    </div>
  )

  if (ordered) return (
    <div className="max-w-3xl mx-auto px-4 py-16 flex flex-col items-center text-center">
      <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center mb-6">
        <ShieldCheck className="w-10 h-10 text-emerald-400" />
      </div>
      <h1 className="text-3xl font-black text-white mb-3">Заказ оформлен!</h1>
      <p className="text-slate-400 mb-8 max-w-sm">
        {paidItems.length > 0
          ? 'После подтверждения оплаты ссылки для скачивания появятся в разделе «Мои заказы».'
          : 'Ссылки для скачивания доступны в разделе «Мои заказы».'}
      </p>
      <div className="flex gap-3">
        <button
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition"
          style={{ boxShadow: 'none' }}
          onClick={() => navigate('/orders')}
        >
          Мои заказы <ArrowRight className="w-4 h-4" />
        </button>
        <button
          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-6 py-2.5 rounded-xl font-semibold text-sm transition"
          style={{ boxShadow: 'none' }}
          onClick={() => navigate('/catalog')}
        >
          В каталог
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Оформление заказа</h1>
        <p className="text-slate-500 text-sm mt-1">Проверьте состав и подтвердите заказ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Форма */}
        <form className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Комментарий <span className="text-slate-600">(необязательно)</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Примечание к заказу..."
              className={`${fieldClass} resize-none`}
              rows={3}
            />
          </div>

          <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 font-semibold text-indigo-400">
              <Download className="w-4 h-4" /> Цифровая доставка
            </div>
            <ul className="space-y-1 text-slate-500 text-xs list-disc list-inside">
              <li>Бесплатные модели доступны сразу</li>
              <li>Платные — после подтверждения оплаты</li>
              <li>Ссылки действуют 72 часа</li>
              <li>Лицензия генерируется автоматически</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={submitting || cartItems.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3.5 font-bold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ boxShadow: 'none' }}
          >
            {submitting ? 'Оформление...' : 'Оформить заказ'}
          </button>
        </form>

        {/* Состав заказа */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-4">Состав заказа</h2>
          {cartItems.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-8">Корзина пуста</p>
          ) : (
            <div className="space-y-3">
              {cartItems.map(item => (
                <div key={item.model_id} className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.preview_image_url ? (
                      <img src={item.preview_image_url} alt={item.title} className="w-full h-full object-contain p-1" />
                    ) : (
                      <Package className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.title}</p>
                    <p className="text-xs text-slate-600">{item.author_name || 'Автор'}</p>
                  </div>
                  <p className="text-sm font-bold text-white flex-shrink-0">
                    {item.is_free
                      ? <span className="text-emerald-400">Бесплатно</span>
                      : `${Number(item.price).toLocaleString()} ₽`
                    }
                  </p>
                </div>
              ))}
              <div className="border-t border-slate-800 pt-3 mt-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-400">Итого</span>
                  <span className="text-xl font-black text-white">
                    {total > 0 ? `${total.toLocaleString()} ₽` : 'Бесплатно'}
                  </span>
                </div>
                {freeItems.length > 0 && paidItems.length > 0 && (
                  <p className="text-xs text-slate-600 mt-1">
                    {freeItems.length} бесплатн. + {paidItems.length} платн.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
