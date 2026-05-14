import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import { useUserQuery } from '../../hooks/useUserQuery'
import { useAddToCart } from '../../hooks/useCartMutations'
import { useAuth } from '../../hooks/useAuth'
import { useSettings } from '../../contexts/SettingsContext'

const ProductCard = ({ product, onToggleFavorite, isFavorite }) => {
  const navigate = useNavigate()
  const { setIsAuthModalOpen } = useAuth()
  const { settings } = useSettings()
  const [selectedSizeId, setSelectedSizeId] = useState(null)
  const mainImage = product.images?.find(img => img.is_primary) || product.images?.[0]
  const { data: user } = useUserQuery()
  const addToCartMutation = useAddToCart(user?.id)

  const handleAddToCart = async (e) => {
    e.stopPropagation()
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    if (!selectedSizeId) {
      toast.error('Выберите размер')
      return
    }
    try {
      await addToCartMutation.mutateAsync({
        productId: product.id,
        sizeId: selectedSizeId,
        quantity: 1,
      })
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  const availableSizes = product.sizes?.filter(s => s.quantity > 0) || []

  return (
    <div
      className="group relative bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/60 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Favorite button */}
      <button
        className={`absolute top-3 right-3 z-10 p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm transition-all duration-200 hover:scale-110 ${
          isFavorite
            ? 'text-rose-500 border-rose-100 bg-rose-50/80'
            : 'text-gray-300 hover:text-rose-400'
        }`}
        style={{ boxShadow: 'none' }}
        onClick={e => { e.stopPropagation(); onToggleFavorite(product) }}
        aria-label="Добавить в избранное"
      >
        <Heart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
      </button>

      {/* Image */}
      <div className="bg-gray-50 mx-3 mt-3 rounded-xl overflow-hidden flex items-center justify-center aspect-square">
        <img
          src={mainImage?.image_url || product.image_url}
          alt={product.name}
          className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105 drop-shadow-md"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Brand */}
        {settings?.show_brand_logos ? (
          <div className="mb-1.5 h-5 flex items-center">
            {product.brand?.logo_url ? (
              <img
                src={product.brand.logo_url}
                alt={product.brand.name}
                className="h-4 w-auto object-contain"
                onError={e => { e.target.style.display = 'none' }}
              />
            ) : (
              <span className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">
                {product.brand?.name}
              </span>
            )}
          </div>
        ) : (
          <span className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold mb-1.5 block">
            {product.brand?.name}
          </span>
        )}

        {/* Name */}
        <p className="font-semibold text-sm text-gray-900 line-clamp-2 leading-snug mb-3">
          {product.name}
        </p>

        {/* Sizes */}
        <div className="mb-3" onClick={e => e.stopPropagation()}>
          {availableSizes.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {availableSizes.map((sizeItem) => (
                <button
                  key={sizeItem.id}
                  className={`px-2 py-0.5 text-xs rounded-lg border font-medium transition-all duration-150 ${
                    selectedSizeId === sizeItem.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-600'
                  }`}
                  style={{
                    ...(selectedSizeId === sizeItem.id && {
                      backgroundColor: 'var(--primary-color)',
                      borderColor: 'var(--primary-color)',
                    }),
                    boxShadow: 'none',
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedSizeId(sizeItem.id)
                  }}
                >
                  {sizeItem.size?.size_value}
                </button>
              ))}
            </div>
          ) : (
            <span className="text-xs text-gray-400">Нет в наличии</span>
          )}
        </div>

        {/* Price + Cart */}
        <div className="flex items-center justify-between mt-auto gap-2">
          <span className="text-lg font-black text-gray-900">
            {product.price}&nbsp;₽
          </span>
          <button
            className="flex items-center gap-1.5 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              backgroundColor: 'var(--primary-color, #4f46e5)',
              boxShadow: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(0.9)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)' }}
            onClick={handleAddToCart}
            disabled={availableSizes.length === 0 || addToCartMutation.isLoading}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {addToCartMutation.isLoading ? '...' : 'В корзину'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
