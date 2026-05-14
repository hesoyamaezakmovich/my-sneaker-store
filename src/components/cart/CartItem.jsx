import React from 'react'
import { Trash2 } from 'lucide-react'
import { useRemoveFromCart } from '../../hooks/useCartMutations'

const CartItem = ({ cartItem }) => {
  const removeFromCartMutation = useRemoveFromCart()

  return (
    <div className="flex items-center gap-4 py-4 border-b border-slate-800 last:border-0">
      <div className="flex-shrink-0 w-14 h-14 bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center border border-slate-700">
        {cartItem.preview_image_url ? (
          <img src={cartItem.preview_image_url} alt={cartItem.title} className="w-full h-full object-contain p-1.5" />
        ) : (
          <svg className="w-7 h-7 text-slate-600" fill="none" viewBox="0 0 48 48">
            <path d="M24 4L44 15V33L24 44L4 33V15L24 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M24 4V44M4 15L24 26L44 15" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm line-clamp-2 leading-snug">{cartItem.title}</p>
        {cartItem.author_name && <p className="text-xs text-slate-500 mt-0.5">{cartItem.author_name}</p>}
        {cartItem.category_name && <p className="text-xs text-slate-600">{cartItem.category_name}</p>}
      </div>

      <div className="flex flex-col items-end gap-2">
        <span className="font-bold text-white text-sm">
          {cartItem.is_free
            ? <span className="text-emerald-400">Бесплатно</span>
            : `${Number(cartItem.price).toLocaleString()} ₽`
          }
        </span>
        <button
          className="text-slate-600 hover:text-rose-400 transition-colors"
          onClick={() => removeFromCartMutation.mutate(cartItem.model_id)}
          disabled={removeFromCartMutation.isPending}
          aria-label="Удалить"
          style={{ boxShadow: 'none' }}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default CartItem
