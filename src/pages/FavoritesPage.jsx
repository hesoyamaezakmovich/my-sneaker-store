import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useFavoritesQuery } from '../hooks/useFavoritesQuery'
import { removeFromFavorites } from '../services/favorites.service'
import ModelList from '../components/model/ModelList'
import { Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function FavoritesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: favorites = [], isLoading } = useFavoritesQuery()

  const removeMutation = useMutation({
    mutationFn: (modelId) => removeFromFavorites(modelId),
    onSuccess: () => {
      queryClient.invalidateQueries(['favorites'])
      toast.success('Удалено из избранного')
    },
    onError: (e) => toast.error(e.message),
  })

  if (isLoading) return <div className="max-w-5xl mx-auto px-4 py-8 text-gray-500">Загрузка...</div>

  const models = favorites.map(f => ({
    id: f.model_id,
    title: f.title,
    price: f.price,
    is_free: f.is_free,
    preview_image_url: f.preview_image_url,
    rating_avg: f.rating_avg,
    author_name: f.author_name,
  }))

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
        <Heart className="w-6 h-6 text-red-500 fill-red-500" />
        Избранное
      </h1>

      {models.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Heart className="w-16 h-16 mb-4" />
          <div className="text-xl mb-2">Список избранного пуст</div>
          <button
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition"
            onClick={() => navigate('/catalog')}
          >
            В каталог
          </button>
        </div>
      ) : (
        <ModelList
          models={models}
          favorites={favorites}
          onToggleFavorite={(model) => removeMutation.mutate(model.id)}
        />
      )}
    </div>
  )
}
