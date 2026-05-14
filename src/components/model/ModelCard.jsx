import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart, Star, Download } from 'lucide-react'
import { useUserQuery } from '../../hooks/useUserQuery'
import { useAddToCart } from '../../hooks/useCartMutations'
import { useAuth } from '../../hooks/useAuth'

const ModelCard = ({ model, onToggleFavorite, isFavorite }) => {
  const navigate = useNavigate()
  const { setIsAuthModalOpen } = useAuth()
  const { data: user } = useUserQuery()
  const addToCartMutation = useAddToCart()

  const handleAddToCart = async (e) => {
    e.stopPropagation()
    if (!user) { setIsAuthModalOpen(true); return }
    try {
      await addToCartMutation.mutateAsync(model.id)
    } catch {}
  }

  const primaryImage = model.images?.find(img => img.is_primary)?.image_url
    || model.images?.[0]?.image_url
    || model.preview_image_url

  return (
    <div
      className="group relative bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
      onClick={() => navigate(`/model/${model.id}`)}
    >
      {/* Кнопка избранного */}
      <button
        className={`absolute top-3 right-3 z-10 p-1.5 rounded-xl transition-all duration-200 hover:scale-110 border ${
          isFavorite
            ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
            : 'text-slate-600 bg-slate-800/80 border-slate-700/50 hover:text-rose-400 hover:border-rose-500/20'
        }`}
        style={{ boxShadow: 'none' }}
        onClick={e => { e.stopPropagation(); onToggleFavorite?.(model) }}
        aria-label="Добавить в избранное"
      >
        <Heart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
      </button>

      {/* Бейдж FREE */}
      {model.is_free && (
        <div className="absolute top-3 left-3 z-10 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
          FREE
        </div>
      )}

      {/* Превью */}
      <div className="bg-slate-800/50 mx-3 mt-3 rounded-xl overflow-hidden flex items-center justify-center aspect-square">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={model.title}
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300 drop-shadow-lg"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-700">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 48 48">
              <path d="M24 4L44 15V33L24 44L4 33V15L24 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M24 4V44M4 15L24 26L44 15" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="text-xs">3D Model</span>
          </div>
        )}
      </div>

      {/* Контент */}
      <div className="flex flex-col flex-1 p-4">
        {model.category_name && (
          <span className="text-[11px] text-slate-600 uppercase tracking-widest font-semibold mb-1.5 block">
            {model.category_name}
          </span>
        )}

        <p className="font-semibold text-sm text-white line-clamp-2 leading-snug mb-2">
          {model.title}
        </p>

        {/* Рейтинг и загрузки */}
        {(model.rating_avg > 0 || model.download_count > 0) && (
          <div className="flex items-center gap-3 mb-3">
            {model.rating_avg > 0 && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                {Number(model.rating_avg).toFixed(1)}
              </span>
            )}
            {model.download_count > 0 && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Download className="w-3 h-3" />
                {model.download_count}
              </span>
            )}
          </div>
        )}

        {/* Цена + Корзина */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <span className="text-lg font-black text-white">
            {model.is_free
              ? <span className="text-emerald-400 text-base font-bold">Бесплатно</span>
              : `${Number(model.price).toLocaleString()} ₽`
            }
          </span>
          <button
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ boxShadow: 'none' }}
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {addToCartMutation.isPending ? '...' : 'В корзину'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModelCard
