import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'

const ProductCard = ({ product, onAddToCart, onToggleFavorite, isFavorite }) => {
  const navigate = useNavigate()
  const mainImage = product.images?.find(img => img.is_primary) || product.images?.[0]

  return (
    <div
      className="group bg-white rounded-3xl border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-200 p-6 flex flex-col relative cursor-pointer overflow-hidden hover:-translate-y-1 min-h-[380px]"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <button
        className={`absolute top-4 right-4 z-10 text-gray-300 hover:text-red-500 transition-colors bg-white/80 rounded-full p-1 shadow ${isFavorite ? 'text-red-500' : ''}`}
        onClick={e => { e.stopPropagation(); onToggleFavorite(product) }}
        aria-label="Добавить в избранное"
      >
        <Heart size={24} fill={isFavorite ? 'red' : 'none'} />
      </button>
      <div className="flex-1 flex items-center justify-center mb-4">
        <img
          src={mainImage?.image_url || product.image_url}
          alt={product.name}
          className="h-44 object-contain mx-auto drop-shadow-lg transition-transform duration-200 group-hover:scale-110"
        />
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-semibold">{product.brand?.name}</div>
          <div className="font-bold text-lg mb-1 line-clamp-2 text-gray-900 leading-tight">{product.name}</div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="text-xl font-extrabold text-gray-900">{product.price} ₽</div>
          <button
            className="bg-black text-white rounded-full px-5 py-2 text-base font-semibold shadow-lg transition-all duration-200 opacity-90 group-hover:opacity-100 group-hover:scale-105 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
            onClick={e => { e.stopPropagation(); onAddToCart(product) }}
          >
            В корзину
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
