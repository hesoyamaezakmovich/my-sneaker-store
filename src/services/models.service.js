import api, { handleApiError } from './api'

// Получить список опубликованных моделей
export const fetchModels = async (params = {}) => {
  try {
    const { data } = await api.get('/models', { params })
    return data
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}

// Получить модель по id
export const fetchModelById = async (id) => {
  try {
    const { data } = await api.get(`/models/${id}`)
    return data.model
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}

// Получить похожие модели
export const fetchSimilarModels = async (modelId) => {
  try {
    const { data } = await api.get(`/models/${modelId}/similar`)
    return data.models
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}

// Получить все категории
export const fetchCategories = async () => {
  try {
    const { data } = await api.get('/models/meta/categories')
    return data.categories
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}

// Получить все теги
export const fetchTags = async () => {
  try {
    const { data } = await api.get('/models/meta/tags')
    return data.tags
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}

// Создать модель (автор)
export const createModel = async (modelData) => {
  try {
    const { data } = await api.post('/models', modelData)
    return data.model
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}

// Обновить модель
export const updateModel = async (id, updates) => {
  try {
    const { data } = await api.patch(`/models/${id}`, updates)
    return data.model
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}

// Удалить модель
export const deleteModel = async (id) => {
  try {
    await api.delete(`/models/${id}`)
    return true
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}

// Получить модели автора
export const fetchAuthorModels = async (authorId) => {
  try {
    const { data } = await api.get(`/models/author/${authorId}`)
    return data.models
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}
