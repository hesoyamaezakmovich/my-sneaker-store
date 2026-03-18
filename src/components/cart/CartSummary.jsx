import React from 'react'

const CartSummary = ({ cartItems, onCheckout }) => {
  const total = cartItems.reduce((sum, item) => sum + (item.is_free ? 0 : Number(item.price || 0)), 0)
  const count = cartItems.length

  return (
    <div>
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Моделей: {count} шт.</span>
          <span className="font-medium">{total.toLocaleString()} ₽</span>
        </div>
        <hr className="border-gray-200" />
        <div className="flex justify-between items-center">
          <span className="text-base font-semibold text-gray-900">Итого:</span>
          <span className="text-xl font-bold text-gray-900">{total.toLocaleString()} ₽</span>
        </div>
      </div>

      <button
        className="w-full bg-blue-600 text-white rounded-full py-3.5 font-bold text-base hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onCheckout}
        disabled={cartItems.length === 0}
      >
        Оформить заказ
      </button>
      <p className="text-xs text-gray-400 text-center mt-2">
        После оплаты — мгновенное скачивание
      </p>
    </div>
  )
}

export default CartSummary
