import React from 'react'
import ModelCard from './ModelCard'
import { useFavoritesQuery } from '../../hooks/useFavoritesQuery'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addToFavorites, removeFromFavorites } from '../../services/favorites.service'
import { useAuth } from '../../hooks/useAuth'
import { useUserQuery } from '../../hooks/useUserQuery'
import toast from 'react-hot-toast'

const ModelList = ({ models, onToggleFavorite, favorites: favsProp }) => {
  const { data: user } = useUserQuery()
  const { setIsAuthModalOpen } = useAuth()
  const { data: favoritesData = [] } = useFavoritesQuery()
  const queryClient = useQueryClient()

  const favorites = favsProp || favoritesData

  const addFavMutation = useMutation({
    mutationFn: addToFavorites,
    onSuccess: () => { queryClient.invalidateQueries(['favorites']); toast.success('Добавлено в избранное') },
    onError: (e) => toast.error(e.message),
  })
  const removeFavMutation = useMutation({
    mutationFn: removeFromFavorites,
    onSuccess: () => { queryClient.invalidateQueries(['favorites']); toast.success('Удалено из избранного') },
    onError: (e) => toast.error(e.message),
  })

  const handleToggleFavorite = (model) => {
    if (onToggleFavorite) { onToggleFavorite(model); return }
    if (!user) { setIsAuthModalOpen(true); return }
    const isFav = favorites.some(f => f.model_id === model.id)
    if (isFav) removeFavMutation.mutate(model.id)
    else addFavMutation.mutate(model.id)
  }

  if (!models || models.length === 0) return null

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {models.map((model) => (
        <ModelCard
          key={model.id}
          model={model}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={favorites.some(f => f.model_id === model.id)}
        />
      ))}
    </div>
  )
}

export default ModelList
