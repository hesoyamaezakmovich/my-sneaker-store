import api, { handleApiError } from './api'

// Получить корзину пользователя
export const fetchCart = async () => {
  try {
    const { data } = await api.get('/cart')
    return data.items
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}

// Добавить модель в корзину
export const addToCart = async (modelId) => {
  try {
    const { data } = await api.post('/cart', { modelId })
    return data.item
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}

// Удалить модель из корзины
export const removeFromCart = async (modelId) => {
  try {
    await api.delete(`/cart/${modelId}`)
    return true
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}

// Очистить корзину
export const clearCart = async () => {
  try {
    await api.delete('/cart')
    return true
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}
