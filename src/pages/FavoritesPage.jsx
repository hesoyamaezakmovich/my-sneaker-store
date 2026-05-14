import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useFavoritesQuery } from '../hooks/useFavoritesQuery'
import { removeFromFavorites } from '../services/favorites.service'
import ModelList from '../components/model/ModelList'
import { Heart, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function FavoritesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: favorites = [], isLoading } = useFavoritesQuery()

  const removeMutation = useMutation({
    mutationFn: (modelId) => removeFromFavorites(modelId),
    onSuccess: () => { queryClient.invalidateQueries(['favorites']); toast.success('Удалено из избранного') },
    onError: (e) => toast.error(e.message),
  })

  if (isLoading) return <div className="max-w-5xl mx-auto px-4 py-8 text-slate-500">Загрузка...</div>

  const models = favorites.map(f => ({
    id:                f.model_id,
    title:             f.title,
    price:             f.price,
    is_free:           f.is_free,
    preview_image_url: f.preview_image_url,
    rating_avg:        f.rating_avg,
    author_name:       f.author_name,
  }))

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-400 fill-rose-400" />
          Избранное
        </h1>
        {models.length > 0 && (
          <p className="text-slate-500 text-sm mt-1">{models.length} сохранённых модел{models.length === 1 ? 'ь' : 'и'}</p>
        )}
      </div>

      {models.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900 border border-slate-800 rounded-2xl text-center px-6">
          <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-5 border border-slate-700">
            <Heart className="w-10 h-10 text-slate-600" />
          </div>
          <p className="text-white font-semibold text-lg mb-2">Здесь пока пусто</p>
          <p className="text-slate-500 text-sm mb-8 max-w-xs leading-relaxed">
            Нажимайте <Heart className="w-3.5 h-3.5 inline text-rose-400" /> на карточках моделей — они сохранятся здесь
          </p>
          <button
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-3 rounded-xl font-semibold text-sm transition shadow-lg shadow-indigo-950/40"
            style={{ boxShadow: 'none' }}
            onClick={() => navigate('/catalog')}
          >
            Перейти в каталог <ArrowRight className="w-4 h-4" />
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
