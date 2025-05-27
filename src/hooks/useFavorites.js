import { useContext } from 'react'
import { FavoritesContext } from '../contexts/FavoritesContext'

export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites должен использоваться внутри FavoritesProvider')
  }
  return context
}
