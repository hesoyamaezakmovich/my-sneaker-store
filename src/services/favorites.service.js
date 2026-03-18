import api, { handleApiError } from './api'

// Получить избранное
export const fetchFavorites = async () => {
  try {
    const { data } = await api.get('/favorites')
    return data.favorites
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}

// Добавить в избранное
export const addToFavorites = async (modelId) => {
  try {
    await api.post('/favorites', { modelId })
    return true
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}

// Удалить из избранного
export const removeFromFavorites = async (modelId) => {
  try {
    await api.delete(`/favorites/${modelId}`)
    return true
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}
