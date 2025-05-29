import React, { useState } from 'react'
import SizeSelector from './SizeSelector'
import toast from 'react-hot-toast'

const ProductDetails = ({ product, onAddToCart }) => {
  const [selectedSizeId, setSelectedSizeId] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const mainImage = selectedImage || product.images?.find(img => img.is_primary) || product.images?.[0]

  const handleAdd = () => {
    if (!selectedSizeId) {
      toast.error('Выберите размер!')
      return
    }
    onAddToCart(product, selectedSizeId)
  }

  // Фильтруем только доступные размеры
  const availableSizes = product.sizes?.filter(s => s.quantity > 0) || []

  return (
    <div className="flex flex-col md:flex-row gap-12">
      {/* Images */}
      <div className="flex-1 flex flex-col items-center bg-white rounded-3xl shadow-2xl p-8 mb-8 md:mb-0">
        <img
          src={mainImage?.image_url || product.image_url}
          alt={product.name}
          className="w-80 h-80 object-contain rounded-2xl bg-gray-50 mb-6 drop-shadow-xl transition-all duration-200"
        />
        {product.images && product.images.length > 1 && (
          <div className="flex gap-3 mt-2">
            {product.images.map(img => (
              <img
                key={img.id}
                src={img.image_url}
                alt=""
                className="w-16 h-16 object-contain rounded-xl border bg-white shadow hover:shadow-lg transition-all duration-150 cursor-pointer"
                style={{ borderColor: img.id === mainImage?.id ? '#000' : '#e5e7eb' }}
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="flex-1 flex flex-col justify-between bg-white rounded-3xl shadow-2xl p-10">
        <div>
          <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-semibold">
            {product.brand?.name}
          </div>
          <h2 className="text-3xl font-extrabold mb-3 text-gray-900 leading-tight">
            {product.name}
          </h2>
          <div className="text-2xl font-bold mb-6 text-gray-900">
            {product.price} ₽
          </div>
          
          <div className="mb-6">
            <div className="font-semibold mb-2 text-gray-700">Размеры:</div>
            {availableSizes.length > 0 ? (
              <SizeSelector
                sizes={availableSizes}
                selectedSizeId={selectedSizeId}
                onChange={setSelectedSizeId}
              />
            ) : (
              <p className="text-gray-500">Нет в наличии</p>
            )}
          </div>
          
          {product.description && (
            <div className="mb-6 border-t pt-6">
              <div className="font-semibold mb-2 text-gray-700">Описание:</div>
              <div className="text-gray-600 text-base whitespace-pre-line leading-relaxed">
                {product.description}
              </div>
            </div>
          )}
          
          {/* Дополнительная информация о наличии */}
          <div className="mb-6 border-t pt-6">
            <div className="font-semibold mb-2 text-gray-700">Наличие по размерам:</div>
            <div className="grid grid-cols-4 gap-2 text-sm">
              {product.sizes?.map(sizeItem => (
                <div 
                  key={sizeItem.id}
                  className={`text-center p-2 rounded ${
                    sizeItem.quantity > 0 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-gray-50 text-gray-400'
                  }`}
                >
                  <div className="font-semibold">{sizeItem.size?.size_value}</div>
                  <div className="text-xs">
                    {sizeItem.quantity > 0 ? `${sizeItem.quantity} шт.` : 'Нет'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <button
          className="mt-8 bg-black text-white rounded-full px-10 py-4 font-bold text-xl hover:bg-gray-800 shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleAdd}
          disabled={availableSizes.length === 0}
        >
          {availableSizes.length === 0 ? 'Нет в наличии' : 'В корзину'}
        </button>
      </div>
    </div>
  )
}

export default ProductDetails