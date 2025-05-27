import React from 'react'

const CartItem = ({ cartItem, onChangeQuantity, onRemove }) => {
  const { product, size, quantity } = cartItem
  const mainImage = product?.images?.find(img => img.is_primary) || product?.images?.[0]

  return (
    <div className="flex gap-6 items-center py-5 mb-6 bg-white rounded-2xl shadow-md px-6">
      <img
        src={mainImage?.image_url || product?.image_url}
        alt={product?.name}
        className="w-24 h-24 object-contain rounded-xl bg-gray-50 shadow"
      />
      <div className="flex-1 min-w-0">
        <div className="font-bold text-lg mb-1 text-gray-900 truncate">{product?.name}</div>
        <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-semibold">{product?.brand?.name}</div>
        <div className="text-xs text-gray-500">Размер: {size?.size_value}</div>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1 rounded-full border bg-gray-100 hover:bg-gray-200 text-lg font-bold transition"
          onClick={() => onChangeQuantity(cartItem, quantity - 1)}
          disabled={quantity <= 1}
        >-</button>
        <span className="w-8 text-center font-semibold text-lg">{quantity}</span>
        <button
          className="px-3 py-1 rounded-full border bg-gray-100 hover:bg-gray-200 text-lg font-bold transition"
          onClick={() => onChangeQuantity(cartItem, quantity + 1)}
        >+</button>
      </div>
      <div className="w-24 text-right font-extrabold text-lg text-gray-900">{(product?.price * quantity).toLocaleString()} ₽</div>
      <button
        className="ml-4 text-gray-300 hover:text-red-500 text-3xl font-bold rounded-full p-1 transition-colors"
        onClick={() => onRemove(cartItem)}
        aria-label="Удалить"
      >
        ×
      </button>
    </div>
  )
}

export default CartItem
