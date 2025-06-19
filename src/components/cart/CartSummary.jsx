import React from 'react'

const CartSummary = ({ cartItems, onCheckout }) => {
  const total = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)
  const itemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Детали заказа */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Товары ({itemsCount} шт.)
          </span>
          <span className="font-medium">
            {total.toLocaleString()} ₽
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Доставка</span>
          <span className="font-medium text-green-600">
            {total >= 5000 ? 'Бесплатно' : '300 ₽'}
          </span>
        </div>
        
        <hr className="border-gray-200" />
        
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Итого:</span>
          <span className="text-2xl font-bold text-gray-900">
            {(total + (total >= 5000 ? 0 : 300)).toLocaleString()} ₽
          </span>
        </div>
      </div>

      {/* Информация о доставке */}
      {total < 5000 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-blue-800">
            Добавьте товаров еще на <strong>{(5000 - total).toLocaleString()} ₽</strong> 
            для бесплатной доставки
          </p>
        </div>
      )}

      {/* Кнопка оформления */}
      <button
        className="w-full bg-black text-white rounded-full py-4 font-bold text-lg hover:bg-gray-800 transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onCheckout}
        disabled={cartItems.length === 0}
      >
        Оформить заказ
      </button>
      
      {/* Дополнительная информация */}
      <p className="text-xs text-gray-500 text-center mt-3">
        Нажимая кнопку, вы соглашаетесь с условиями оферты
      </p>
    </div>
  )
}

export default CartSummary