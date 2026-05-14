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
      className="group relative bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Favorite button */}
      <button
        className={`absolute top-3 right-3 z-10 p-1.5 rounded-xl transition-all duration-200 hover:scale-110 border ${
          isFavorite
            ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
            : 'text-slate-600 bg-slate-800/80 border-slate-700/50 hover:text-rose-400 hover:border-rose-500/20'
        }`}
        style={{ boxShadow: 'none' }}
        onClick={e => { e.stopPropagation(); onToggleFavorite(product) }}
        aria-label="Добавить в избранное"
      >
        <Heart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
      </button>

      {/* Image area */}
      <div className="bg-slate-800/50 mx-3 mt-3 rounded-xl overflow-hidden flex items-center justify-center aspect-square">
        <img
          src={mainImage?.image_url || product.image_url}
          alt={product.name}
          className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105 drop-shadow-lg"
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
                className="h-4 w-auto object-contain opacity-70"
                onError={e => { e.target.style.display = 'none' }}
              />
            ) : (
              <span className="text-[11px] text-slate-600 uppercase tracking-widest font-semibold">
                {product.brand?.name}
              </span>
            )}
          </div>
        ) : (
          <span className="text-[11px] text-slate-600 uppercase tracking-widest font-semibold mb-1.5 block">
            {product.brand?.name}
          </span>
        )}

        {/* Name */}
        <p className="font-semibold text-sm text-white line-clamp-2 leading-snug mb-3">
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
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-transparent text-slate-400 border-slate-700 hover:border-indigo-500/60 hover:text-indigo-300'
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
            <span className="text-xs text-slate-600">Нет в наличии</span>
          )}
        </div>

        {/* Price + Cart */}
        <div className="flex items-center justify-between mt-auto gap-2">
          <span className="text-lg font-black text-white">
            {product.price}&nbsp;₽
          </span>
          <button
            className="flex items-center gap-1.5 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              backgroundColor: 'var(--primary-color, #4f46e5)',
              boxShadow: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)' }}
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
