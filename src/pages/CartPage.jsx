import CartItem from '../components/cart/CartItem'
import CartSummary from '../components/cart/CartSummary'
import { useCartQuery } from '../hooks/useCartQuery'
import { ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUserQuery } from '../hooks/useUserQuery'

export default function CartPage() {
  const { data: user, isLoading: authLoading } = useUserQuery()
  const { data: cartItems = [], isLoading: cartLoading } = useCartQuery()
  const navigate = useNavigate()

  const handleCheckout = () => {
    navigate('/checkout')
  }

  if (authLoading || cartLoading) {
    return <div className="max-w-3xl mx-auto px-4 py-8 text-gray-500">Загрузка...</div>
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col items-center justify-center text-gray-400">
        <ShoppingCart className="w-16 h-16 mb-4" />
        <div className="text-xl mb-2">Войдите, чтобы просматривать корзину</div>
        <button
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition"
          onClick={() => navigate('/')}
        >
          На главную
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Корзина</h1>
      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <ShoppingCart className="w-16 h-16 mb-4" />
          <div className="text-xl mb-2">Ваша корзина пуста</div>
          <button
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition"
            onClick={() => navigate('/catalog')}
          >
            Перейти в каталог
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            {cartItems.map(item => (
              <CartItem key={item.id} cartItem={item} />
            ))}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-fit">
            <CartSummary cartItems={cartItems} onCheckout={handleCheckout} />
          </div>
        </div>
      )}
    </div>
  )
}
