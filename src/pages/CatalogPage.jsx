import React, { useState, useEffect } from 'react'
import Button from '../components/ui/Button'
import Input, { Select } from '../components/ui/Input'
import ModelList from '../components/model/ModelList'
import { fetchModels, fetchCategories, fetchTags } from '../services/models.service'
import { useAuth } from '../hooks/useAuth'
import { useAddToCart } from '../hooks/useCartMutations'
import { useUserQuery } from '../hooks/useUserQuery'
import { useFavoritesQuery } from '../hooks/useFavoritesQuery'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addToFavorites, removeFromFavorites } from '../services/favorites.service'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router-dom'

const SORTS = [
  { label: 'Новинки', value: 'newest' },
  { label: 'Популярные', value: 'popular' },
  { label: 'По рейтингу', value: 'rating' },
  { label: 'Сначала дешевле', value: 'price_asc' },
  { label: 'Сначала дороже', value: 'price_desc' },
]

const CatalogPage = () => {
  const { setIsAuthModalOpen } = useAuth()
  const { data: user } = useUserQuery()
  const addToCartMutation = useAddToCart()
  const { data: favorites = [] } = useFavoritesQuery()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [models, setModels] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    tag: searchParams.get('tag') || '',
    priceMin: '',
    priceMax: '',
    sort: searchParams.get('sort') || 'newest',
    search: '',
    isFree: '',
  })

  // Загрузка мета-данных
  useEffect(() => {
    Promise.all([fetchCategories(), fetchTags()])
      .then(([cats, tgs]) => {
        setCategories(cats || [])
        setTags(tgs || [])
      })
      .catch(() => {})
  }, [])

  // Загрузка моделей при изменении фильтров
  useEffect(() => {
    setLoading(true)
    const params = {}
    if (filters.category) params.category = filters.category
    if (filters.tag) params.tag = filters.tag
    if (filters.priceMin) params.priceMin = filters.priceMin
    if (filters.priceMax) params.priceMax = filters.priceMax
    if (filters.sort) params.sort = filters.sort
    if (filters.search) params.search = filters.search
    if (filters.isFree === 'true') params.isFree = 'true'

    fetchModels(params)
      .then((data) => {
        setModels(data.models || [])
        setTotal(data.total || 0)
      })
      .catch(() => toast.error('Ошибка загрузки моделей'))
      .finally(() => setLoading(false))
  }, [filters])

  const handleChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddToCart = async (model) => {
    if (!user) { setIsAuthModalOpen(true); return }
    try {
      await addToCartMutation.mutateAsync(model.id)
    } catch {}
  }

  const addFavoriteMutation = useMutation({
    mutationFn: (modelId) => addToFavorites(modelId),
    onSuccess: () => { queryClient.invalidateQueries(['favorites']); toast.success('Добавлено в избранное') },
    onError: (e) => toast.error(e.message || 'Ошибка'),
  })
  const removeFavoriteMutation = useMutation({
    mutationFn: (modelId) => removeFromFavorites(modelId),
    onSuccess: () => { queryClient.invalidateQueries(['favorites']); toast.success('Удалено из избранного') },
    onError: (e) => toast.error(e.message || 'Ошибка'),
  })

  const handleToggleFavorite = (model) => {
    if (!user) { setIsAuthModalOpen(true); return }
    const isFav = favorites.some(f => f.model_id === model.id)
    if (isFav) removeFavoriteMutation.mutate(model.id)
    else addFavoriteMutation.mutate(model.id)
  }

  const resetFilters = () => setFilters({ category: '', tag: '', priceMin: '', priceMax: '', sort: 'newest', search: '', isFree: '' })

  const categoryOptions = [{ label: 'Все категории', value: '' }, ...categories.map(c => ({ label: c.name, value: c.slug }))]
  const tagOptions = [{ label: 'Все теги', value: '' }, ...tags.map(t => ({ label: t.name, value: t.slug }))]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Каталог 3D-моделей</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Фильтры */}
        <aside className="w-full md:w-64 bg-white rounded-xl shadow p-6 mb-6 md:mb-0 h-fit">
          <h2 className="text-lg font-semibold mb-4">Фильтры</h2>
          <div className="space-y-4">
            <Input
              label="Поиск"
              type="text"
              placeholder="Название модели..."
              value={filters.search}
              onChange={e => handleChange('search', e.target.value)}
            />
            <Select
              label="Категория"
              options={categoryOptions}
              value={filters.category}
              onChange={e => handleChange('category', e.target.value)}
            />
            <Select
              label="Тег"
              options={tagOptions}
              value={filters.tag}
              onChange={e => handleChange('tag', e.target.value)}
            />
            <Select
              label="Сортировка"
              options={SORTS}
              value={filters.sort}
              onChange={e => handleChange('sort', e.target.value)}
            />
            <div className="flex gap-2">
              <Input
                label="Цена от"
                type="number"
                min={0}
                value={filters.priceMin}
                onChange={e => handleChange('priceMin', e.target.value)}
              />
              <Input
                label="до"
                type="number"
                min={0}
                value={filters.priceMax}
                onChange={e => handleChange('priceMax', e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.isFree === 'true'}
                onChange={e => handleChange('isFree', e.target.checked ? 'true' : '')}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Только бесплатные</span>
            </label>
            <Button variant="secondary" fullWidth onClick={resetFilters}>
              Сбросить фильтры
            </Button>
          </div>
        </aside>

        {/* Список моделей */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">
              {loading ? 'Загрузка...' : `Найдено моделей: ${total}`}
            </span>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow p-4 flex flex-col animate-pulse">
                  <div className="w-full aspect-square bg-gray-100 rounded-xl mb-3" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-1/2 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg mb-4">По вашему запросу ничего не найдено</p>
              <Button variant="secondary" onClick={resetFilters}>Сбросить фильтры</Button>
            </div>
          ) : (
            <ModelList
              models={models}
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
              favorites={favorites}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default CatalogPage
