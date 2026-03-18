import api, { handleApiError } from './api'

// Создать заказ из текущей корзины
export const createOrder = async ({ notes } = {}) => {
  try {
    const { data } = await api.post('/orders', { notes })
    return data.order
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}

// Получить заказы текущего пользователя
export const fetchOrders = async () => {
  try {
    const { data } = await api.get('/orders')
    return data.orders
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}

// Получить заказ по id
export const fetchOrderById = async (orderId) => {
  try {
    const { data } = await api.get(`/orders/${orderId}`)
    return data.order
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}

// Получить ссылки для скачивания по лицензии
export const fetchDownloadLinks = async (licenseId) => {
  try {
    const { data } = await api.get(`/orders/downloads/${licenseId}`)
    return data.files
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}
