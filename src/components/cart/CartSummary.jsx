import React from 'react'

const CartSummary = ({ cartItems, onCheckout }) => {
  const total = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6">
      <div className="flex justify-between items-center mb-2">
        <div className="text-xl font-semibold text-gray-700">Итого:</div>
        <div className="text-3xl font-extrabold text-gray-900">{total.toLocaleString()} ₽</div>
      </div>
      <button
        className="w-full bg-black text-white rounded-full py-4 font-bold text-lg hover:bg-gray-800 transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-black"
        onClick={onCheckout}
        disabled={cartItems.length === 0}
      >
        Оформить заказ
      </button>
    </div>
  )
}

export default CartSummary
