import React from 'react'
import { motion } from 'framer-motion'
import ModelCard from './ModelCard'
import { useFavoritesQuery } from '../../hooks/useFavoritesQuery'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addToFavorites, removeFromFavorites } from '../../services/favorites.service'
import { useAuth } from '../../hooks/useAuth'
import { useUserQuery } from '../../hooks/useUserQuery'
import toast from 'react-hot-toast'

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
    },
  },
}

const cardVariant = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

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
    <motion.div
      className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {models.map((model) => (
        <motion.div key={model.id} variants={cardVariant}>
          <ModelCard
            model={model}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={favorites.some(f => f.model_id === model.id)}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}

export default ModelList
