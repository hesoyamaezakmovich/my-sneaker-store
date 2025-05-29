import React, { useEffect, useState } from 'react'
import CartItem from '../components/cart/CartItem'
import CartSummary from '../components/cart/CartSummary'
import { fetchCart, updateCartItem, removeFromCart } from '../services/cart.service'
import { ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUserQuery } from '../hooks/useUserQuery'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { data: user, isLoading: authLoading } = useUserQuery()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      setCartItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    fetchCart(user.id)
      .then(setCartItems)
      .catch(() => setError('Ошибка загрузки корзины'))
      .finally(() => setLoading(false))
  }, [user])

  const handleChangeQuantity = (item, newQuantity) => {
    if (!user || newQuantity < 1) return
    updateCartItem(user.id, item.product_id, item.size_id, newQuantity)
      .then(() => setCartItems(items => items.map(ci => ci.id === item.id ? { ...ci, quantity: newQuantity } : ci)))
      .catch(() => setError('Ошибка изменения количества'))
  }

  const handleRemove = (item) => {
    if (!user) return
    removeFromCart(user.id, item.product_id, item.size_id)
      .then(() => setCartItems(items => items.filter(ci => ci.id !== item.id)))
      .catch(() => setError('Ошибка удаления из корзины'))
  }

  const handleCheckout = () => {
    toast('Оформить заказ (заглушка)')
  }

  if (authLoading) return <div className="max-w-3xl mx-auto px-4 py-8">Загрузка...</div>
  if (!user) return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col items-center justify-center text-gray-400">
      <ShoppingCart className="w-16 h-16 mb-4" />
      <div className="text-xl mb-2">Войдите, чтобы просматривать корзину</div>
      <button className="mt-4 bg-black text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-800 transition" onClick={() => navigate('/')}>На главную</button>
    </div>
  )

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8">Загрузка...</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Корзина</h1>
      {error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <ShoppingCart className="w-16 h-16 mb-4" />
          <div className="text-xl mb-2">Ваша корзина пуста</div>
          <button className="mt-4 bg-black text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-800 transition" onClick={() => navigate('/catalog')}>
            Перейти в каталог
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow p-6 divide-y">
            {cartItems.map(item => (
              <CartItem
                key={item.id}
                cartItem={item}
                onChangeQuantity={handleChangeQuantity}
                onRemove={handleRemove}
              />
            ))}
          </div>
          <CartSummary cartItems={cartItems} onCheckout={handleCheckout} />
        </>
      )}
    </div>
  )
}
