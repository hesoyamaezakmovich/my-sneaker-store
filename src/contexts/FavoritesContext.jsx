import React, { createContext, useContext, useState, useEffect } from 'react'
import { fetchFavorites, addToFavorites, removeFromFavorites } from '../services/favorites.service'
import { useAuth } from '../hooks/useAuth'

export const FavoritesContext = createContext({})

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(false)

  // Загрузка избранного при изменении пользователя
  useEffect(() => {
    if (user?.id) {
      setLoading(true)
      fetchFavorites(user.id)
        .then(setFavorites)
        .finally(() => setLoading(false))
    } else {
      setFavorites([])
    }
  }, [user?.id])

  // Добавить в избранное
  const addFavorite = async (productId) => {
    if (!user?.id) return
    setLoading(true)
    await addToFavorites(user.id, productId)
    const updated = await fetchFavorites(user.id)
    setFavorites(updated)
    setLoading(false)
  }

  // Удалить из избранного
  const removeFavorite = async (productId) => {
    if (!user?.id) return
    setLoading(true)
    await removeFromFavorites(user.id, productId)
    const updated = await fetchFavorites(user.id)
    setFavorites(updated)
    setLoading(false)
  }

  return (
    <FavoritesContext.Provider value={{ favorites, loading, addFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavoritesContext = () => useContext(FavoritesContext) 