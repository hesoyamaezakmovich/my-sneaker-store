import React from 'react'

const CartSummary = ({ cartItems, onCheckout }) => {
  const total = cartItems.reduce((sum, item) => sum + (item.is_free ? 0 : Number(item.price || 0)), 0)

  return (
    <div>
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Позиций: {cartItems.length}</span>
          <span className="text-slate-300 font-medium">{total.toLocaleString()} ₽</span>
        </div>
        <div className="h-px bg-slate-800" />
        <div className="flex justify-between items-center">
          <span className="font-semibold text-white">Итого:</span>
          <span className="text-xl font-black text-white">{total.toLocaleString()} ₽</span>
        </div>
      </div>

      <button
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3.5 font-bold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        onClick={onCheckout}
        disabled={cartItems.length === 0}
        style={{ boxShadow: 'none' }}
      >
        Оформить заказ
      </button>
      <p className="text-xs text-slate-600 text-center mt-2">После оплаты — мгновенное скачивание</p>
    </div>
  )
}

export default CartSummary
