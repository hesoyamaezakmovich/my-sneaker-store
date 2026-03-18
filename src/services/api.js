import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const STORAGE_KEY = 'rks-auth-token'
const REFRESH_KEY = 'rks-refresh-token'

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Добавляем токен к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Автообновление токена при 401
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem(REFRESH_KEY)
      if (!refreshToken) {
        isRefreshing = false
        clearAuthTokens()
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken })
        const { accessToken, refreshToken: newRefreshToken } = response.data
        setAuthTokens(accessToken, newRefreshToken)
        processQueue(null, accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearAuthTokens()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export const setAuthTokens = (accessToken, refreshToken) => {
  localStorage.setItem(STORAGE_KEY, accessToken)
  if (refreshToken) {
    localStorage.setItem(REFRESH_KEY, refreshToken)
  }
}

export const clearAuthTokens = () => {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export const getAccessToken = () => localStorage.getItem(STORAGE_KEY)
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY)

export const handleApiError = (error) => {
  if (error.response) {
    return error.response.data?.error || `Ошибка ${error.response.status}`
  }
  if (error.message?.includes('timeout')) {
    return 'Превышено время ожидания. Попробуйте ещё раз.'
  }
  if (error.message?.includes('Network')) {
    return 'Ошибка соединения. Проверьте интернет-подключение.'
  }
  return error.message || 'Произошла неизвестная ошибка'
}

export default api
