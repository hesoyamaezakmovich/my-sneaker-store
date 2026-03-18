import React, { useEffect, useState } from 'react'
import Button from '../components/ui/Button'
import { Link } from 'react-router-dom'
import { fetchModels, fetchCategories } from '../services/models.service'
import ModelList from '../components/model/ModelList'
import { Box, Layers, Download, Shield, Star } from 'lucide-react'

const FEATURES = [
  { icon: <Box className="w-8 h-8 text-blue-600" />, title: 'Широкий каталог', desc: 'Тысячи 3D-моделей в форматах OBJ, FBX, STL, GLTF, BLEND и других' },
  { icon: <Download className="w-8 h-8 text-green-600" />, title: 'Мгновенная загрузка', desc: 'Скачивайте сразу после оплаты — ссылка активна 72 часа' },
  { icon: <Shield className="w-8 h-8 text-purple-600" />, title: 'Лицензионная защита', desc: 'Каждая покупка сопровождается лицензионным ключом' },
  { icon: <Star className="w-8 h-8 text-yellow-500" />, title: 'Проверенные авторы', desc: 'Все модели проходят модерацию перед публикацией' },
]

const HomePage = () => {
  const [popularModels, setPopularModels] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchModels({ sort: 'popular', limit: 4 }),
      fetchCategories(),
    ])
      .then(([modelsData, cats]) => {
        setPopularModels(modelsData.models || [])
        setCategories(cats || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center gap-8 mb-16">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full mb-4">
            <Layers className="w-4 h-4" />
            АРОО «РКС» — Маркетплейс 3D-моделей
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 leading-tight">
            Профессиональные <span className="text-blue-600">3D-модели</span> для любых проектов
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Покупайте и продавайте высококачественные 3D-модели. Архитектура, персонажи, транспорт, интерьеры и многое другое.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button as={Link} to="/catalog" size="large" variant="primary">
              Перейти в каталог
            </Button>
            <Button as={Link} to="/author" size="large" variant="secondary">
              Стать автором
            </Button>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-md bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 flex items-center justify-center aspect-square shadow-xl">
            <div className="text-center">
              <div className="text-8xl mb-4">🧊</div>
              <p className="text-gray-500 text-sm">Ваша 3D-модель здесь</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-start">
              <div className="mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Категории</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.slice(0, 10).map((cat) => (
              <Link
                key={cat.id}
                to={`/catalog?category=${cat.slug}`}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-4 text-center group"
              >
                <div className="text-3xl mb-2">🧩</div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Popular Models */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Популярные модели</h2>
          <Link to="/catalog?sort=popular" className="text-blue-600 hover:underline text-sm font-medium">
            Смотреть все →
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow p-4 flex flex-col animate-pulse">
                <div className="w-full aspect-square bg-gray-100 rounded-xl mb-3" />
                <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-1/2 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : popularModels.length > 0 ? (
          <ModelList models={popularModels} />
        ) : (
          <div className="text-gray-500 text-center py-8">Нет моделей для отображения</div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-10 text-center text-white">
        <h3 className="text-2xl font-bold mb-3">Вы создаёте 3D-модели?</h3>
        <p className="text-blue-100 mb-6">Станьте автором на платформе и начните зарабатывать на своих работах</p>
        <Link
          to="/author"
          className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-full hover:bg-blue-50 transition-colors"
        >
          Кабинет автора
        </Link>
      </section>
    </div>
  )
}

export default HomePage
