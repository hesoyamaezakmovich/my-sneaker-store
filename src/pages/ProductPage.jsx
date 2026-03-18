import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchModelById, fetchSimilarModels } from '../services/models.service'
import { useAuth } from '../hooks/useAuth'
import { useAddToCart } from '../hooks/useCartMutations'
import { useUserQuery } from '../hooks/useUserQuery'
import ModelList from '../components/model/ModelList'
import Button from '../components/ui/Button'
import { Download, Star, Eye, ShoppingCart, Heart, ArrowLeft, FileType, User } from 'lucide-react'
import { MODEL_FORMAT_LABELS, LICENSE_TYPE_LABELS } from '../utils/constants'

const ModelPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { setIsAuthModalOpen } = useAuth()
  const { data: user } = useUserQuery()
  const addToCartMutation = useAddToCart()
  const [model, setModel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [similar, setSimilar] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetchModelById(id)
      .then((m) => {
        setModel(m)
        const primary = m.images?.find(img => img.is_primary) || m.images?.[0]
        setSelectedImage(primary?.image_url || m.preview_image_url)
      })
      .catch(() => navigate('/catalog'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!model) return
    fetchSimilarModels(model.id)
      .then(setSimilar)
      .catch(() => {})
  }, [model])

  const handleAddToCart = async () => {
    if (!user) { setIsAuthModalOpen(true); return }
    try {
      await addToCartMutation.mutateAsync(model.id)
    } catch {}
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-8" />
          <div className="flex gap-8">
            <div className="w-1/2 aspect-square bg-gray-100 rounded-2xl" />
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-24 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!model) return null

  const primaryImage = selectedImage || model.preview_image_url
  const formats = model.files?.map(f => f.file_format) || []

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Назад к каталогу
      </button>

      <div className="flex flex-col lg:flex-row gap-10 mb-16">
        {/* Галерея */}
        <div className="flex-1">
          <div className="bg-gray-50 rounded-2xl aspect-square flex items-center justify-center overflow-hidden mb-3 shadow">
            {primaryImage ? (
              <img src={primaryImage} alt={model.title} className="w-full h-full object-contain p-4" />
            ) : (
              <div className="text-8xl text-gray-200">🧊</div>
            )}
          </div>
          {model.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {model.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === img.image_url ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Детали */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {model.category_name || 'Без категории'}
            </span>
            {model.is_free && (
              <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">Бесплатно</span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">{model.title}</h1>

          <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {model.author_name || model.author_email}
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              {Number(model.rating_avg || 0).toFixed(1)} ({model.rating_count || 0})
            </div>
            <div className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              {model.download_count || 0} загрузок
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {model.view_count || 0} просмотров
            </div>
          </div>

          {model.description && (
            <p className="text-gray-600 mb-6 leading-relaxed">{model.description}</p>
          )}

          {/* Характеристики */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
            {formats.length > 0 && (
              <div className="flex items-start gap-2">
                <FileType className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-gray-500 mr-1">Форматы:</span>
                  <span className="text-gray-800 font-medium">
                    {formats.map(f => MODEL_FORMAT_LABELS[f] || f).join(', ')}
                  </span>
                </div>
              </div>
            )}
            {model.polygon_count && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Полигонов:</span>
                <span className="text-gray-800 font-medium">{model.polygon_count.toLocaleString()}</span>
              </div>
            )}
            {model.software_used && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Программа:</span>
                <span className="text-gray-800 font-medium">{model.software_used}</span>
              </div>
            )}
            {model.license_type && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Лицензия:</span>
                <span className="text-gray-800 font-medium">{LICENSE_TYPE_LABELS[model.license_type] || model.license_type}</span>
              </div>
            )}
          </div>

          {/* Теги */}
          {model.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {model.tags.map(tag => (
                <span key={tag.id} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Цена и кнопки */}
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl font-extrabold text-gray-900">
              {model.is_free ? 'Бесплатно' : `${Number(model.price).toLocaleString()} ₽`}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="primary"
              size="large"
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending}
              className="flex-1 flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              {addToCartMutation.isPending ? 'Добавляем...' : 'В корзину'}
            </Button>
          </div>

          <p className="text-xs text-gray-400 mt-3 text-center">
            После оплаты ссылка для скачивания будет активна 72 часа
          </p>
        </div>
      </div>

      {/* Похожие модели */}
      {similar.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Похожие модели</h2>
          <ModelList models={similar} />
        </section>
      )}
    </div>
  )
}

export default ModelPage
