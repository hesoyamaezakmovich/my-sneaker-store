import React, { useEffect, useState } from 'react'
import { fetchFavorites, removeFromFavorites } from '../services/favorites.service'
import ProductList from '../components/product/ProductList'
import { Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      setFavorites([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    fetchFavorites(user.id)
      .then(setFavorites)
      .catch((e) => setError('Ошибка загрузки избранного'))
      .finally(() => setLoading(false))
  }, [user])

  const handleRemoveFavorite = (product) => {
    if (!user) return
    removeFromFavorites(user.id, product.id)
      .then(() => setFavorites(favs => favs.filter(f => f.product.id !== product.id)))
      .catch(() => setError('Ошибка удаления из избранного'))
  }

  if (authLoading) return <div className="max-w-7xl mx-auto px-4 py-8">Загрузка...</div>
  if (!user) return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center justify-center text-gray-400">
      <Heart className="w-16 h-16 mb-4" />
      <div className="text-xl mb-2">Войдите, чтобы просматривать избранное</div>
      <button className="mt-4 bg-black text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-800 transition" onClick={() => navigate('/')}>На главную</button>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Избранное</h1>
      {loading ? (
        <div>Загрузка...</div>
      ) : error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : favorites.length === 0 ? (
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
