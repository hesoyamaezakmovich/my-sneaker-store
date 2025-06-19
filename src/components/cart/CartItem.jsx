import React from 'react'

const CartItem = ({ cartItem, onChangeQuantity, onRemove }) => {
  const { product, size, quantity } = cartItem
  const mainImage = product?.images?.find(img => img.is_primary) || product?.images?.[0]

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-b-0">
      {/* Изображение товара */}
      <div className="flex-shrink-0">
        <img
          src={mainImage?.image_url || product?.image_url}
          alt={product?.name}
          className="w-20 h-20 object-contain rounded-lg bg-gray-50 border"
        />
      </div>

      {/* Информация о товаре */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
          {product?.name}
        </h3>
        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
          {product?.brand?.name}
        </p>
        <p className="text-xs text-gray-600">
          Размер: {size?.size_value}
        </p>
      </div>

      {/* Количество и цена */}
      <div className="flex flex-col items-end gap-2">
        {/* Цена */}
        <div className="font-bold text-lg text-gray-900">
          {(product?.price * quantity).toLocaleString()} ₽
        </div>
        
        {/* Контролы количества */}
        <div className="flex items-center gap-2">
          <button
            className="w-8 h-8 rounded-full border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center text-lg font-bold transition-colors disabled:opacity-50"
            onClick={() => onChangeQuantity(cartItem, quantity - 1)}
            disabled={quantity <= 1}
          >
            −
          </button>
          <span className="w-8 text-center font-semibold text-base">
            {quantity}
          </span>
          <button
            className="w-8 h-8 rounded-full border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center text-lg font-bold transition-colors"
            onClick={() => onChangeQuantity(cartItem, quantity + 1)}
          >
            +
          </button>
        </div>
      </div>

      {/* Кнопка удаления */}
      <button
        className="flex-shrink-0 ml-2 text-gray-400 hover:text-red-500 text-2xl font-bold p-1 transition-colors"
        onClick={() => onRemove(cartItem)}
        aria-label="Удалить из корзины"
      >
        ×
      </button>
    </div>
  )
}

export default CartItem