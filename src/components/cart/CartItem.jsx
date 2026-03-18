import React from 'react'
import { useRemoveFromCart } from '../../hooks/useCartMutations'
import { Trash2 } from 'lucide-react'

const CartItem = ({ cartItem }) => {
  const removeFromCartMutation = useRemoveFromCart()

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-b-0">
      {/* Превью */}
      <div className="flex-shrink-0 w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center border">
        {cartItem.preview_image_url ? (
          <img src={cartItem.preview_image_url} alt={cartItem.title} className="w-full h-full object-contain p-1" />
        ) : (
          <span className="text-2xl">🧊</span>
        )}
      </div>

      {/* Информация о модели */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-sm mb-0.5 line-clamp-2">{cartItem.title}</h3>
        <p className="text-xs text-gray-500">{cartItem.author_name}</p>
        {cartItem.category_name && (
          <p className="text-xs text-gray-400">{cartItem.category_name}</p>
        )}
      </div>

      {/* Цена и удаление */}
      <div className="flex flex-col items-end gap-2">
        <div className="font-bold text-gray-900">
          {cartItem.is_free ? (
            <span className="text-green-600 text-sm">Бесплатно</span>
          ) : (
            `${Number(cartItem.price).toLocaleString()} ₽`
          )}
        </div>
        <button
          className="text-gray-400 hover:text-red-500 transition-colors"
          onClick={() => removeFromCartMutation.mutate(cartItem.model_id)}
          disabled={removeFromCartMutation.isPending}
          aria-label="Удалить"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default CartItem
