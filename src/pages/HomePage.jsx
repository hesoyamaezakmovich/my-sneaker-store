import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Box, Layers, Download, Shield, Star, ArrowRight, Zap } from 'lucide-react'
import { fetchModels, fetchCategories } from '../services/models.service'
import ModelList from '../components/model/ModelList'

const FEATURES = [
  {
    icon: <Layers className="w-6 h-6 text-indigo-600" />,
    bg: 'bg-indigo-50',
    title: 'Широкий каталог',
    desc: 'Тысячи 3D-моделей в форматах OBJ, FBX, STL, GLTF, BLEND и других',
  },
  {
    icon: <Download className="w-6 h-6 text-emerald-600" />,
    bg: 'bg-emerald-50',
    title: 'Мгновенная загрузка',
    desc: 'Скачивайте сразу после оплаты — ссылка активна 72 часа',
  },
  {
    icon: <Shield className="w-6 h-6 text-violet-600" />,
    bg: 'bg-violet-50',
    title: 'Лицензионная защита',
    desc: 'Каждая покупка сопровождается лицензионным ключом',
  },
  {
    icon: <Star className="w-6 h-6 text-amber-500" />,
    bg: 'bg-amber-50',
    title: 'Проверенные авторы',
    desc: 'Все модели проходят модерацию перед публикацией',
  },
]

const CATEGORY_COLORS = [
  { from: '#eef2ff', to: '#e0e7ff', text: '#4338ca' },
  { from: '#f5f3ff', to: '#ede9fe', text: '#6d28d9' },
  { from: '#ecfdf5', to: '#d1fae5', text: '#065f46' },
  { from: '#fffbeb', to: '#fef3c7', text: '#92400e' },
  { from: '#fff1f2', to: '#ffe4e6', text: '#9f1239' },
  { from: '#ecfeff', to: '#cffafe', text: '#164e63' },
  { from: '#fff7ed', to: '#fed7aa', text: '#9a3412' },
  { from: '#f0fdf4', to: '#bbf7d0', text: '#14532d' },
  { from: '#fdf4ff', to: '#f5d0fe', text: '#701a75' },
  { from: '#f8fafc', to: '#e2e8f0', text: '#1e293b' },
]

const CATEGORY_ICONS = ['🏗️', '👤', '🚗', '🌲', '🏠', '⚙️', '🎮', '✈️', '🐾', '💎']

const Cube3D = () => (
  <div className="relative flex items-center justify-center w-56 h-56 lg:w-72 lg:h-72">
    {/* Glow */}
    <div className="absolute inset-8 bg-indigo-500/20 rounded-full blur-3xl animate-glow" />
    <div
      className="absolute inset-12 bg-violet-500/15 rounded-full blur-2xl animate-glow"
      style={{ animationDelay: '1.5s' }}
    />

    {/* Perspective wrapper */}
    <div style={{ perspective: '700px' }}>
      <div
        className="relative w-28 h-28 animate-rotate-cube"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl border border-indigo-400/50 bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 backdrop-blur-sm flex items-center justify-center"
          style={{ transform: 'translateZ(56px)' }}
        >
          <Box className="w-9 h-9 text-indigo-300/90" />
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl border border-indigo-400/30 bg-gradient-to-br from-indigo-600/10 to-indigo-500/5"
          style={{ transform: 'rotateY(180deg) translateZ(56px)' }}
        />
        {/* Right */}
        <div
          className="absolute inset-0 rounded-2xl border border-violet-400/40 bg-gradient-to-br from-violet-500/20 to-violet-600/10"
          style={{ transform: 'rotateY(90deg) translateZ(56px)' }}
        />
        {/* Left */}
        <div
          className="absolute inset-0 rounded-2xl border border-violet-400/25 bg-gradient-to-br from-violet-500/10 to-violet-600/5"
          style={{ transform: 'rotateY(-90deg) translateZ(56px)' }}
        />
        {/* Top */}
        <div
          className="absolute inset-0 rounded-2xl border border-indigo-300/45 bg-gradient-to-br from-indigo-400/25 to-indigo-300/10"
          style={{ transform: 'rotateX(90deg) translateZ(56px)' }}
        />
        {/* Bottom */}
        <div
          className="absolute inset-0 rounded-2xl border border-indigo-400/15 bg-indigo-500/5"
          style={{ transform: 'rotateX(-90deg) translateZ(56px)' }}
        />
      </div>
    </div>

    {/* Floating format badges */}
    <div
      className="absolute top-3 -right-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-1.5 text-xs font-bold text-white/90 shadow-lg animate-float"
      style={{ animationDelay: '0s' }}
    >
      .OBJ
    </div>
    <div
      className="absolute bottom-10 -left-4 bg-indigo-500/25 backdrop-blur-md border border-indigo-400/30 rounded-xl px-3 py-1.5 text-xs font-bold text-indigo-200 shadow-lg animate-float"
      style={{ animationDelay: '1.4s' }}
    >
      .FBX
    </div>
    <div
      className="absolute bottom-3 right-1 bg-violet-500/25 backdrop-blur-md border border-violet-400/30 rounded-xl px-3 py-1.5 text-xs font-bold text-violet-200 shadow-lg animate-float"
      style={{ animationDelay: '2.8s' }}
    >
      .GLTF
    </div>
    <div
      className="absolute top-1/2 -left-8 bg-white/8 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-white/60 shadow-lg animate-float"
      style={{ animationDelay: '0.7s' }}
    >
      .STL
    </div>
  </div>
)

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

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-slate-950 rounded-3xl mb-16 px-8 py-20 lg:py-28">
        {/* Background decoration */}
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] bg-indigo-600/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-violet-600/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.15),transparent)] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left: Text */}
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold px-4 py-2 rounded-full mb-6">
              <Zap className="w-3.5 h-3.5" />
              АРОО «РКС» — Маркетплейс 3D-моделей
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.08] tracking-tight mb-5">
              Профессиональные
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                3D&#8209;модели
              </span>
              <br />
              для любых проектов
            </h1>

            <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
              Покупайте и продавайте высококачественные 3D-модели — архитектура, персонажи, транспорт, интерьеры и многое другое.
            </p>

            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-950/60"
              >
                Перейти в каталог
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/author"
                className="inline-flex items-center gap-2 border border-white/15 hover:border-white/30 hover:bg-white/5 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200"
              >
                Стать автором
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 mt-10 justify-center lg:justify-start">
              <div>
                <p className="text-2xl font-black text-white">10K+</p>
                <p className="text-slate-500 text-xs mt-0.5">Моделей</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <p className="text-2xl font-black text-white">500+</p>
                <p className="text-slate-500 text-xs mt-0.5">Авторов</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <p className="text-2xl font-black text-white">50K+</p>
                <p className="text-slate-500 text-xs mt-0.5">Покупок</p>
              </div>
            </div>
          </div>

          {/* Right: 3D Cube */}
          <div className="flex-shrink-0">
            <Cube3D />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group p-6 rounded-2xl border border-gray-100 bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/60 transition-all duration-300"
            >
              <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Категории</h2>
              <p className="text-gray-400 text-sm mt-0.5">Найдите нужную 3D-модель</p>
            </div>
            <Link
              to="/catalog"
              className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center gap-1 transition-colors"
            >
              Все <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {categories.slice(0, 10).map((cat, i) => {
              const colors = CATEGORY_COLORS[i % CATEGORY_COLORS.length]
              return (
                <Link
                  key={cat.id}
                  to={`/catalog?category=${cat.slug}`}
                  className="group relative overflow-hidden rounded-2xl p-5 text-center border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                  style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}
                >
                  <div className="text-2xl mb-2">{CATEGORY_ICONS[i % CATEGORY_ICONS.length]}</div>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: colors.text }}
                  >
                    {cat.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Popular Models ── */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Популярные модели</h2>
            <p className="text-gray-400 text-sm mt-0.5">Самые востребованные работы</p>
          </div>
          <Link
            to="/catalog?sort=popular"
            className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center gap-1 transition-colors"
          >
            Смотреть все <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col animate-pulse">
                <div className="w-full aspect-square bg-gray-100 rounded-xl mb-3" />
                <div className="h-4 w-3/4 bg-gray-100 rounded-lg mb-2" />
                <div className="h-4 w-1/2 bg-gray-50 rounded-lg" />
              </div>
            ))}
          </div>
        ) : popularModels.length > 0 ? (
          <ModelList models={popularModels} />
        ) : (
          <div className="text-gray-400 text-center py-16 bg-gray-50 rounded-2xl">
            Нет моделей для отображения
          </div>
        )}
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden bg-slate-950 rounded-3xl p-12 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_100%,rgba(99,102,241,0.2),transparent)] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
        <div className="relative">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-500/15 border border-indigo-500/25 rounded-2xl mb-5">
            <Box className="w-7 h-7 text-indigo-400" />
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white mb-3">
            Вы создаёте 3D-модели?
          </h3>
          <p className="text-slate-400 mb-8 max-w-sm mx-auto">
            Станьте автором на платформе и начните зарабатывать на своих работах
          </p>
          <Link
            to="/author"
            className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold px-8 py-3.5 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Открыть кабинет автора
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage
