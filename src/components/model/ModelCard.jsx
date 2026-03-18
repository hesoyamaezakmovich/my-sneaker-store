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

  const handleCardClick = () => navigate(`/model/${model.id}`)

  const primaryImage = model.images?.find(img => img.is_primary)?.image_url
    || model.images?.[0]?.image_url
    || model.preview_image_url

  return (
    <div
      className="group bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-200 p-3 flex flex-col relative cursor-pointer overflow-hidden hover:-translate-y-1 min-h-[300px]"
      onClick={handleCardClick}
    >
      {/* Избранное */}
      <button
        className={`absolute top-3 right-3 z-10 bg-white/80 rounded-full p-1.5 shadow transition-colors ${isFavorite ? 'text-red-500' : 'text-gray-300 hover:text-red-500'}`}
        onClick={e => { e.stopPropagation(); onToggleFavorite?.(model) }}
        aria-label="Добавить в избранное"
      >
        <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
      </button>

      {/* Бейдж бесплатно */}
      {model.is_free && (
        <div className="absolute top-3 left-3 z-10 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          FREE
        </div>
      )}

      {/* Превью */}
      <div className="flex-none flex items-center justify-center mb-3 bg-gray-50 rounded-xl overflow-hidden aspect-square">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={model.title}
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
        ) : (
          <div className="text-5xl text-gray-200 group-hover:scale-110 transition-transform duration-200">🧊</div>
        )}
      </div>

      {/* Контент */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {model.category_name && (
            <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">
              {model.category_name}
            </div>
          )}
          <div className="font-bold text-sm line-clamp-2 text-gray-900 mb-2 leading-tight">
            {model.title}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
            {model.rating_avg > 0 && (
              <span className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                {Number(model.rating_avg).toFixed(1)}
              </span>
            )}
            {model.download_count > 0 && (
              <span className="flex items-center gap-0.5">
                <Download className="w-3 h-3" />
                {model.download_count}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="text-lg font-extrabold text-gray-900">
            {model.is_free ? (
              <span className="text-green-600">Бесплатно</span>
            ) : (
              `${Number(model.price).toLocaleString()} ₽`
            )}
          </div>
          <button
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
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
