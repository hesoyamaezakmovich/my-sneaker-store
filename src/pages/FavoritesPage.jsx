import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchFavorites, removeFromFavorites } from '../services/favorites.service'
import ProductList from '../components/product/ProductList'
import { Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUserQuery } from '../hooks/useUserQuery'
import toast from 'react-hot-toast'

export default function FavoritesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: user, isLoading: userLoading } = useUserQuery()

  const {
    data: favorites,
    isLoading,
    isError,
    error
  } = useQuery(['favorites', user?.id], () => fetchFavorites(user.id), {
    enabled: !!user?.id
  })

  const removeMutation = useMutation({
    mutationFn: (productId) => removeFromFavorites(user.id, productId),
    onSuccess: () => {
      queryClient.invalidateQueries(['favorites', user.id])
      toast.success('Удалено из избранного')
    },
    onError: (e) => {
      toast.error(e.message || 'Ошибка удаления из избранного')
    }
  })

  if (userLoading) return <div className="max-w-7xl mx-auto px-4 py-8">Загрузка...</div>
  if (!user) return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center justify-center text-gray-400">
      <Heart className="w-16 h-16 mb-4" />
      <div className="text-xl mb-2">Войдите, чтобы просматривать избранное</div>
      <button className="mt-4 bg-black text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-800 transition" onClick={() => navigate('/')}>На главную</button>
    </div>
  )

  if (isLoading) return <div className="max-w-7xl mx-auto px-4 py-8">Загрузка...</div>
  if (isError) return <div className="text-red-500 mb-4">{error.message || 'Ошибка загрузки избранного'}</div>

  const handleRemoveFavorite = (product) => {
    removeMutation.mutate(product.id)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Избранное</h1>
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Heart className="w-16 h-16 mb-4" />
          <div className="text-xl mb-2">У вас пока нет избранных товаров</div>
          <button className="mt-4 bg-black text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-800 transition" onClick={() => navigate('/catalog')}>
            Перейти в каталог
          </button>
        </div>
      ) : (
        <ProductList
          products={favorites.map(fav => fav.product)}
          onAddToCart={() => {}}
          onToggleFavorite={handleRemoveFavorite}
          favorites={favorites}
        />
      )}
    </div>
  )
}
