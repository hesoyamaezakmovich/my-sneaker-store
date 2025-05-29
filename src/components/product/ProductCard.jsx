import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import { useUserQuery } from '../../hooks/useUserQuery'
import { useAddToCart } from '../../hooks/useCartMutations'

const ProductCard = ({ product, onToggleFavorite, isFavorite }) => {
  const navigate = useNavigate()
  const [selectedSize, setSelectedSize] = useState(null)
  const mainImage = product.images?.find(img => img.is_primary) || product.images?.[0]
  const { data: user } = useUserQuery()
  const addToCartMutation = useAddToCart(user?.id)

  const handleAddToCart = (e) => {
    e.stopPropagation()
    if (!selectedSize) {
      toast.error('Выберите размер')
      return
    }
    if (!user) {
      toast.error('Войдите, чтобы добавить в корзину')
      return
    }
    addToCartMutation.mutate({ productId: product.id, sizeId: selectedSize, quantity: 1 })
  }

  const handleCardClick = () => {
    navigate(`/product/${product.id}`)
  }

  const availableSizes = product.sizes?.filter(s => s.quantity > 0) || []

  return (
    <div
      className="group bg-white rounded-3xl border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-200 p-6 flex flex-col relative cursor-pointer overflow-hidden hover:-translate-y-1 min-h-[420px]"
      onClick={handleCardClick}
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
        
        {/* Селектор размеров */}
        <div className="mb-3" onClick={e => e.stopPropagation()}>
          <div className="flex flex-wrap gap-1">
            {availableSizes.map((sizeItem) => (
              <button
                key={sizeItem.id}
                className={`px-2 py-1 text-xs rounded border transition-all ${
                  selectedSize === sizeItem.size_id
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedSize(sizeItem.size_id)
                }}
              >
                {sizeItem.size?.size_value}
              </button>
            ))}
          </div>
          {availableSizes.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">Нет в наличии</p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xl font-extrabold text-gray-900">{product.price} ₽</div>
          <button
            className="bg-black text-white rounded-full px-5 py-2 text-base font-semibold shadow-lg transition-all duration-200 opacity-90 group-hover:opacity-100 group-hover:scale-105 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddToCart}
            disabled={availableSizes.length === 0}
          >
            В корзину
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard