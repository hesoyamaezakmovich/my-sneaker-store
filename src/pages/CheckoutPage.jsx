import React, { useState, useEffect } from 'react'
import { fetchCart, clearCart } from '../services/cart.service'
import { createOrder } from '../services/orders.service'
import CartItem from '../components/cart/CartItem'
import { useUserQuery } from '../hooks/useUserQuery'
import toast from 'react-hot-toast'
import { generateOrderNumber } from '../utils/helpers'

export default function CheckoutPage() {
  const { data: user, isLoading: authLoading } = useUserQuery()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    phone: '',
    email: '',
    shipping_address: '',
    shipping_city: '',
    shipping_postal_code: '',
    notes: '',
  })

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

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (cartItems.length === 0) return toast.error('Корзина пуста!')
    if (!user) return
    setError(null)
    try {
      const order = {
        user_id: user.id,
        order_number: generateOrderNumber(),
        total_amount: cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0),
        status: 'pending',
        phone: form.phone,
        email: form.email,
        shipping_address: form.shipping_address,
        shipping_city: form.shipping_city,
        shipping_postal_code: form.shipping_postal_code,
        notes: form.notes,
      }
      await createOrder(order, cartItems)
      await clearCart(user.id)
      setCartItems([])
      toast.success('Заказ успешно оформлен!')
    } catch {
      setError('Ошибка оформления заказа')
      toast.error('Ошибка оформления заказа')
    }
  }

  if (authLoading) return <div className="max-w-3xl mx-auto px-4 py-8">Загрузка...</div>
  if (!user) return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col items-center justify-center text-gray-400">
      <div className="text-xl mb-2">Войдите, чтобы оформить заказ</div>
      <button className="mt-4 bg-black text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-800 transition" onClick={() => window.location.href = '/'}>На главную</button>
    </div>
  )

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8">Загрузка...</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Оформление заказа</h1>
      <form className="bg-white rounded-xl shadow p-6 mb-8" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input name="phone" value={form.phone} onChange={handleChange} required placeholder="Телефон" className="input" />
          <input name="email" value={form.email} onChange={handleChange} required placeholder="Email" className="input" />
          <input name="shipping_address" value={form.shipping_address} onChange={handleChange} required placeholder="Адрес" className="input col-span-2" />
          <input name="shipping_city" value={form.shipping_city} onChange={handleChange} required placeholder="Город" className="input" />
          <input name="shipping_postal_code" value={form.shipping_postal_code} onChange={handleChange} required placeholder="Индекс" className="input" />
        </div>
        <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Комментарий к заказу" className="input w-full mb-4" rows={2} />
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <button type="submit" className="w-full bg-black text-white rounded py-3 font-semibold text-lg hover:bg-gray-800 transition">
          Оформить заказ
        </button>
      </form>
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Ваш заказ</h2>
        {cartItems.length === 0 ? (
          <div className="text-gray-500 text-center">Корзина пуста</div>
        ) : (
          cartItems.map(item => (
            <CartItem key={item.id} cartItem={item} onChangeQuantity={() => {}} onRemove={() => {}} />
          ))
        )}
      </div>
    </div>
  )
}
