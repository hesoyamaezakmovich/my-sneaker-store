import React, { useState } from 'react'
import SizeSelector from './SizeSelector'
import toast from 'react-hot-toast'
import { ShoppingCart } from 'lucide-react'

const ProductDetails = ({ product, onAddToCart }) => {
  const [selectedSizeId, setSelectedSizeId] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const mainImage = selectedImage || product.images?.find(img => img.is_primary) || product.images?.[0]
  const availableSizes = product.sizes?.filter(s => s.quantity > 0) || []

  const handleAdd = () => {
    if (!selectedSizeId) { toast.error('Выберите размер!'); return }
    onAddToCart(product, selectedSizeId)
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Images */}
      <div className="flex-1 flex flex-col items-center bg-slate-900 border border-slate-800 rounded-3xl p-8">
        <div className="w-full aspect-square bg-slate-800/60 rounded-2xl flex items-center justify-center mb-5 overflow-hidden">
          {mainImage?.image_url || product.image_url ? (
            <img
              src={mainImage?.image_url || product.image_url}
              alt={product.name}
              className="w-full h-full object-contain p-4 drop-shadow-xl"
            />
          ) : (
            <svg className="w-24 h-24 text-slate-700" fill="none" viewBox="0 0 48 48">
              <path d="M24 4L44 15V33L24 44L4 33V15L24 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M24 4V44M4 15L24 26L44 15" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          )}
        </div>
        {product.images && product.images.length > 1 && (
          <div className="flex gap-2 flex-wrap justify-center">
            {product.images.map(img => (
              <button
                key={img.id}
                className={`w-14 h-14 rounded-xl border overflow-hidden bg-slate-800 transition-all duration-200 ${
                  img.id === mainImage?.id ? 'border-indigo-500' : 'border-slate-700 hover:border-slate-500'
                }`}
                style={{ boxShadow: 'none' }}
                onClick={() => setSelectedImage(img)}
              >
                <img src={img.image_url} alt="" className="w-full h-full object-contain p-1" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-3xl p-8">
        <div className="flex-1">
          {product.brand?.name && (
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-2">
              {product.brand.name}
            </p>
          )}
          <h2 className="text-3xl font-black text-white leading-tight mb-3">{product.name}</h2>
          <p className="text-3xl font-black text-indigo-400 mb-6">{product.price} ₽</p>

          <div className="mb-6">
            <p className="text-sm font-semibold text-slate-400 mb-2">Размеры:</p>
            {availableSizes.length > 0 ? (
              <SizeSelector
                sizes={availableSizes}
                selectedSizeId={selectedSizeId}
                onChange={setSelectedSizeId}
              />
            ) : (
              <p className="text-slate-600 text-sm">Нет в наличии</p>
            )}
          </div>

          {product.description && (
            <div className="mb-6 border-t border-slate-800 pt-5">
              <p className="text-sm font-semibold text-slate-400 mb-2">Описание:</p>
              <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div className="mb-6 border-t border-slate-800 pt-5">
              <p className="text-sm font-semibold text-slate-400 mb-3">Наличие по размерам:</p>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map(sizeItem => (
                  <div
                    key={sizeItem.id}
                    className={`text-center py-2 px-1 rounded-xl border text-xs font-medium ${
                      sizeItem.quantity > 0
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800/60 border-slate-800 text-slate-600'
                    }`}
                  >
                    <div className="font-bold">{sizeItem.size?.size_value}</div>
                    <div className="opacity-70">{sizeItem.quantity > 0 ? `${sizeItem.quantity}шт` : 'Нет'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-8 py-4 font-bold text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ boxShadow: 'none' }}
          onClick={handleAdd}
          disabled={availableSizes.length === 0}
        >
          <ShoppingCart className="w-5 h-5" />
          {availableSizes.length === 0 ? 'Нет в наличии' : 'В корзину'}
        </button>
      </div>
    </div>
  )
}

export default ProductDetails
