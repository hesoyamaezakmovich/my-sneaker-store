import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
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
    console.log('Пользователь пытается добавить в корзину', { productId: product.id, selectedSizeId })
    
    if (!user) {
      setIsAuthModalOpen(true)
      console.log('Открытие модального окна авторизации')
      return
    }
    
    if (!selectedSizeId) {
      toast.error('Выберите размер')
      console.log('Ошибка: размер не выбран')
      return
    }
    
    try {
      await addToCartMutation.mutateAsync({ 
        productId: product.id, 
        sizeId: selectedSizeId, 
        quantity: 1 
      })
      console.log('Товар добавлен в корзину', { productId: product.id, sizeId: selectedSizeId })
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  const handleCardClick = () => {
    console.log('Переход к карточке товара', { productId: product.id })
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
        onClick={e => { e.stopPropagation(); onToggleFavorite(product); console.log('Пользователь добавил/убрал из избранного', { productId: product.id }) }}
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
          {/* Показ логотипа или названия бренда в зависимости от настройки */}
          {settings?.show_brand_logos ? (
            <div className="flex items-center mb-2">
              {product.brand?.logo_url ? (
                <div className="flex items-center gap-2">
                  <img 
                    src={product.brand.logo_url} 
                    alt={product.brand.name}
                    className="h-6 w-auto object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'block'
                    }}
                  />
                  <span className="text-xs text-gray-400 uppercase tracking-wide font-semibold" style={{display: 'none'}}>
                    {product.brand?.name}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-semibold">
                  {product.brand?.name}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-semibold">
              {product.brand?.name}
            </div>
          )}
          
          <div className="font-bold text-lg mb-1 line-clamp-2 text-gray-900 leading-tight">
            {product.name}
          </div>
        </div>
        
        {/* Селектор размеров */}
        <div className="mb-3" onClick={e => e.stopPropagation()}>
          <div className="flex flex-wrap gap-1">
            {availableSizes.map((sizeItem) => (
              <button
                key={sizeItem.id}
                className={`px-2 py-1 text-xs rounded border transition-all ${
                  selectedSizeId === sizeItem.id
                    ? 'text-white border-black'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
                style={selectedSizeId === sizeItem.id ? {
                  backgroundColor: 'var(--primary-color)',
                  borderColor: 'var(--primary-color)'
                } : {}}
                onMouseEnter={(e) => {
                  if (selectedSizeId !== sizeItem.id) {
                    e.target.style.borderColor = 'var(--primary-color)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedSizeId !== sizeItem.id) {
                    e.target.style.borderColor = ''
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedSizeId(sizeItem.id)
                  console.log('Пользователь выбрал размер', { productId: product.id, sizeId: sizeItem.id })
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
            className="text-white rounded-full px-5 py-2 text-base font-semibold shadow-lg transition-all duration-200 opacity-90 group-hover:opacity-100 group-hover:scale-105 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--primary-color)',
              ':hover': {
                backgroundColor: 'var(--primary-color)',
                filter: 'brightness(0.9)'
              }
            }}
            onMouseEnter={(e) => {
              e.target.style.filter = 'brightness(0.9)'
            }}
            onMouseLeave={(e) => {
              e.target.style.filter = 'brightness(1)'
            }}
            onClick={handleAddToCart}
            disabled={availableSizes.length === 0 || addToCartMutation.isLoading}
          >
            {addToCartMutation.isLoading ? '...' : 'В корзину'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard