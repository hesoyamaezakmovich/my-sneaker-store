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
import { SlidersHorizontal, RotateCcw } from 'lucide-react'

const SORTS = [
  { label: 'Новинки',          value: 'newest'    },
  { label: 'Популярные',       value: 'popular'   },
  { label: 'По рейтингу',      value: 'rating'    },
  { label: 'Сначала дешевле',  value: 'price_asc' },
  { label: 'Сначала дороже',   value: 'price_desc'},
]

const CatalogPage = () => {
  const { setIsAuthModalOpen } = useAuth()
  const { data: user }           = useUserQuery()
  const addToCartMutation        = useAddToCart()
  const { data: favorites = [] } = useFavoritesQuery()
  const queryClient              = useQueryClient()
  const [searchParams]           = useSearchParams()

  const [categories, setCategories] = useState([])
  const [tags, setTags]             = useState([])
  const [models, setModels]         = useState([])
  const [total, setTotal]           = useState(0)
  const [loading, setLoading]       = useState(true)

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    tag:      searchParams.get('tag')      || '',
    priceMin: '',
    priceMax: '',
    sort:     searchParams.get('sort')     || 'newest',
    search:   '',
    isFree:   '',
  })

  useEffect(() => {
    Promise.all([fetchCategories(), fetchTags()])
      .then(([cats, tgs]) => {
        setCategories(cats || [])
        setTags(tgs || [])
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (filters.category) params.category = filters.category
    if (filters.tag)      params.tag      = filters.tag
    if (filters.priceMin) params.priceMin = filters.priceMin
    if (filters.priceMax) params.priceMax = filters.priceMax
    if (filters.sort)     params.sort     = filters.sort
    if (filters.search)   params.search   = filters.search
    if (filters.isFree === 'true') params.isFree = 'true'

    fetchModels(params)
      .then(data => {
        setModels(data.models || [])
        setTotal(data.total || 0)
      })
      .catch(() => toast.error('Ошибка загрузки моделей'))
      .finally(() => setLoading(false))
  }, [filters])

  const handleChange = (name, value) =>
    setFilters(prev => ({ ...prev, [name]: value }))

  const handleAddToCart = async (model) => {
    if (!user) { setIsAuthModalOpen(true); return }
    try { await addToCartMutation.mutateAsync(model.id) } catch {}
  }

  const addFavoriteMutation = useMutation({
    mutationFn: (modelId) => addToFavorites(modelId),
    onSuccess:  () => { queryClient.invalidateQueries(['favorites']); toast.success('Добавлено в избранное') },
    onError:    (e) => toast.error(e.message || 'Ошибка'),
  })
  const removeFavoriteMutation = useMutation({
    mutationFn: (modelId) => removeFromFavorites(modelId),
    onSuccess:  () => { queryClient.invalidateQueries(['favorites']); toast.success('Удалено из избранного') },
    onError:    (e) => toast.error(e.message || 'Ошибка'),
  })

  const handleToggleFavorite = (model) => {
    if (!user) { setIsAuthModalOpen(true); return }
    const isFav = favorites.some(f => f.model_id === model.id)
    if (isFav) removeFavoriteMutation.mutate(model.id)
    else       addFavoriteMutation.mutate(model.id)
  }

  const resetFilters = () =>
    setFilters({ category: '', tag: '', priceMin: '', priceMax: '', sort: 'newest', search: '', isFree: '' })

  const categoryOptions = [{ label: 'Все категории', value: '' }, ...categories.map(c => ({ label: c.name, value: c.slug }))]
  const tagOptions      = [{ label: 'Все теги',      value: '' }, ...tags.map(t => ({ label: t.name, value: t.slug }))]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Каталог 3D-моделей</h1>
        <p className="text-slate-500 text-sm mt-1">Профессиональные модели для любых проектов</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">

        {/* ── Фильтры ── */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sticky top-24">
            <div className="flex items-center gap-2 mb-5">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">Фильтры</h2>
            </div>

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

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Цена, ₽</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    placeholder="от"
                    value={filters.priceMin}
                    onChange={e => handleChange('priceMin', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="до"
                    value={filters.priceMax}
                    onChange={e => handleChange('priceMax', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.isFree === 'true'}
                  onChange={e => handleChange('isFree', e.target.checked ? 'true' : '')}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                />
                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                  Только бесплатные
                </span>
              </label>

              <button
                onClick={resetFilters}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-sm font-medium py-2.5 rounded-xl transition-all duration-200"
                style={{ boxShadow: 'none' }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Сбросить фильтры
              </button>
            </div>
          </div>
        </aside>

        {/* ── Список моделей ── */}
        <div className="flex-1 min-w-0">
          <div className="mb-4">
            <span className="text-sm text-slate-500">
              {loading ? 'Загрузка...' : `Найдено: ${total} ${total === 1 ? 'модель' : total < 5 ? 'модели' : 'моделей'}`}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col animate-pulse">
                  <div className="w-full aspect-square bg-slate-800 rounded-xl mb-3" />
                  <div className="h-3.5 w-3/4 bg-slate-800 rounded-lg mb-2" />
                  <div className="h-3.5 w-1/2 bg-slate-800/60 rounded-lg" />
                </div>
              ))}
            </div>
          ) : models.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="text-4xl mb-4 opacity-30">
                <svg className="w-16 h-16 text-slate-600" fill="none" viewBox="0 0 48 48">
                  <path d="M24 4L44 15V33L24 44L4 33V15L24 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M24 4V44M4 15L24 26L44 15" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <p className="text-slate-400 font-medium mb-1">Ничего не найдено</p>
              <p className="text-slate-600 text-sm mb-5">Попробуйте изменить параметры поиска</p>
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium px-5 py-2.5 rounded-xl transition-all"
                style={{ boxShadow: 'none' }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Сбросить фильтры
              </button>
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
