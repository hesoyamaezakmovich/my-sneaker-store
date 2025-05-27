import React, { useState, useEffect } from 'react'
import Button from '../components/ui/Button'
import Input, { Select } from '../components/ui/Input'
import ProductList from '../components/product/ProductList'
import { fetchProducts } from '../services/products.service'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { useFavorites } from '../hooks/useFavorites'
import toast from 'react-hot-toast'

const BRANDS = [
  { label: 'Nike', value: 'nike' },
  { label: 'Adidas', value: 'adidas' },
  { label: 'New Balance', value: 'new-balance' },
  { label: 'Puma', value: 'puma' },
  { label: 'Reebok', value: 'reebok' },
  { label: 'Vans', value: 'vans' },
  { label: 'Converse', value: 'converse' },
  { label: 'ASICS', value: 'asics' },
]
const CATEGORIES = [
  { label: 'Беговые', value: 'running' },
  { label: 'Баскетбольные', value: 'basketball' },
  { label: 'Повседневные', value: 'lifestyle' },
  { label: 'Скейтбординг', value: 'skateboarding' },
  { label: 'Теннисные', value: 'tennis' },
]
const SIZES = [
  { label: '36', value: '36' }, { label: '37', value: '37' }, { label: '38', value: '38' },
  { label: '39', value: '39' }, { label: '40', value: '40' }, { label: '41', value: '41' },
  { label: '42', value: '42' }, { label: '43', value: '43' }, { label: '44', value: '44' },
  { label: '45', value: '45' }, { label: '46', value: '46' },
]
const SORTS = [
  { label: 'По популярности', value: 'popular' },
  { label: 'Сначала дешевые', value: 'price-asc' },
  { label: 'Сначала дорогие', value: 'price-desc' },
  { label: 'Новинки', value: 'new' },
]

const CatalogPage = () => {
  const { user, setIsAuthModalOpen } = useAuth()
  const { addToCart } = useCart()
  const { favorites, addFavorite, removeFavorite } = useFavorites()
  
  // Фильтры
  const [filters, setFilters] = useState({
    brand: '',
    category: '',
    size: '',
    priceFrom: '',
    priceTo: '',
    sort: 'popular',
  })
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Загрузка товаров
  useEffect(() => {
    setLoading(true)
    fetchProducts()
      .then(setProducts)
      .catch((error) => {
        console.error('Error loading products:', error)
        toast.error('Ошибка загрузки товаров')
      })
      .finally(() => setLoading(false))
  }, [])

  // Обработчик изменения фильтров
  const handleChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  // Обработчик добавления в корзину
  const handleAddToCart = async (product, sizeId) => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    
    try {
      await addToCart(product.id, sizeId, 1)
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }
  
  // Обработчик избранного
  const handleToggleFavorite = async (product) => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    
    const isFavorite = favorites.some(fav => fav.product_id === product.id)
    
    try {
      if (isFavorite) {
        await removeFavorite(product.id)
      } else {
        await addFavorite(product.id)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  // Фильтрация товаров
  const filteredProducts = products.filter(product => {
    // Фильтр по бренду
    if (filters.brand && product.brand?.name.toLowerCase() !== filters.brand) {
      return false
    }
    
    // Фильтр по категории
    if (filters.category && product.category?.slug !== filters.category) {
      return false
    }
    
    // Фильтр по размеру
    if (filters.size) {
      const hasSize = product.sizes?.some(s => 
        s.size?.size_value === filters.size && s.quantity > 0
      )
      if (!hasSize) return false
    }
    
    // Фильтр по цене
    if (filters.priceFrom && product.price < Number(filters.priceFrom)) {
      return false
    }
    if (filters.priceTo && product.price > Number(filters.priceTo)) {
      return false
    }
    
    return true
  })

  // Сортировка товаров
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sort) {
      case 'price-asc':
        return a.price - b.price
      case 'price-desc':
        return b.price - a.price
      case 'new':
        return new Date(b.created_at) - new Date(a.created_at)
      default:
        return 0
    }
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Каталог кроссовок</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters */}
        <aside className="w-full md:w-64 bg-white rounded-xl shadow p-6 mb-6 md:mb-0 h-fit">
          <h2 className="text-lg font-semibold mb-4">Фильтры</h2>
          <div className="space-y-4">
            <Select
              label="Бренд"
              options={[{ label: 'Все', value: '' }, ...BRANDS]}
              value={filters.brand}
              onChange={e => handleChange('brand', e.target.value)}
            />
            <Select
              label="Категория"
              options={[{ label: 'Все', value: '' }, ...CATEGORIES]}
              value={filters.category}
              onChange={e => handleChange('category', e.target.value)}
            />
            <Select
              label="Размер"
              options={[{ label: 'Все', value: '' }, ...SIZES]}
              value={filters.size}
              onChange={e => handleChange('size', e.target.value)}
            />
            <div className="flex gap-2">
              <Input
                label="Цена от"
                type="number"
                min={0}
                value={filters.priceFrom}
                onChange={e => handleChange('priceFrom', e.target.value)}
                inputClassName="pr-2"
              />
              <Input
                label="до"
                type="number"
                min={0}
                value={filters.priceTo}
                onChange={e => handleChange('priceTo', e.target.value)}
                inputClassName="pr-2"
              />
            </div>
            <Button 
              variant="secondary" 
              fullWidth 
              onClick={() => setFilters({ 
                brand: '', 
                category: '', 
                size: '', 
                priceFrom: '', 
                priceTo: '', 
                sort: 'popular' 
              })}
            >
              Сбросить фильтры
            </Button>
          </div>
        </aside>

        {/* Catalog */}
        <section className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="text-gray-500 text-sm">
              Найдено товаров: <span className="font-semibold">{sortedProducts.length}</span>
            </div>
            <Select
              label=""
              options={SORTS}
              value={filters.sort}
              onChange={e => handleChange('sort', e.target.value)}
              className="w-56"
            />
          </div>

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow p-4 flex flex-col items-center animate-pulse">
                  <div className="w-32 h-32 bg-gray-200 rounded-lg mb-3" />
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-16 bg-gray-100 rounded mb-2" />
                  <div className="h-8 w-full bg-gray-200 rounded mt-2" />
                </div>
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg mb-4">
                По вашему запросу ничего не найдено
              </p>
              <Button 
                variant="secondary" 
                onClick={() => setFilters({ 
                  brand: '', 
                  category: '', 
                  size: '', 
                  priceFrom: '', 
                  priceTo: '', 
                  sort: 'popular' 
                })}
              >
                Сбросить фильтры
              </Button>
            </div>
          ) : (
            <ProductList
              products={sortedProducts}
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
              favorites={favorites}
            />
          )}

          {/* Pagination (заглушка) */}
          {sortedProducts.length > 0 && (
            <div className="flex justify-center mt-10">
              <Button variant="ghost" disabled>
                &lt;
              </Button>
              <span className="mx-4 text-gray-600">Страница 1 из 1</span>
              <Button variant="ghost" disabled>
                &gt;
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default CatalogPage