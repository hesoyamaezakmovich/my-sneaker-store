import React from 'react'
import { ShoppingCart, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import CartItem from '../components/cart/CartItem'
import CartSummary from '../components/cart/CartSummary'
import { useCartQuery } from '../hooks/useCartQuery'
import { useUserQuery } from '../hooks/useUserQuery'

export default function CartPage() {
  const { data: user, isLoading: authLoading } = useUserQuery()
  const { data: cartItems = [], isLoading: cartLoading } = useCartQuery()
  const navigate = useNavigate()

  if (authLoading || cartLoading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-slate-500">Загрузка...</div>
  )

  if (!user) return (
    <div className="max-w-3xl mx-auto px-4 py-16 flex flex-col items-center text-center text-slate-500">
      <ShoppingCart className="w-14 h-14 mb-4 text-slate-700" />
      <p className="text-lg mb-4">Войдите, чтобы просматривать корзину</p>
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
        <h1 className="text-2xl font-bold text-white">Корзина</h1>
        <p className="text-slate-500 text-sm mt-1">Проверьте заказ перед оформлением</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900 border border-slate-800 rounded-2xl text-center">
          <ShoppingCart className="w-14 h-14 text-slate-700 mb-4" />
          <p className="text-slate-400 font-medium mb-1">Ваша корзина пуста</p>
          <p className="text-slate-600 text-sm mb-6">Добавьте 3D-модели из каталога</p>
          <button
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition"
            style={{ boxShadow: 'none' }}
            onClick={() => navigate('/catalog')}
          >
            Перейти в каталог <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            {cartItems.map(item => <CartItem key={item.id} cartItem={item} />)}
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-fit">
            <CartSummary cartItems={cartItems} onCheckout={() => navigate('/checkout')} />
          </div>
        </div>
      )}
    </div>
  )
}
