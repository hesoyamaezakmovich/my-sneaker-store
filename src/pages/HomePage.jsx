import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Box, Layers, Download, Shield, Star, ArrowRight, Zap } from 'lucide-react'
import { fetchModels, fetchCategories } from '../services/models.service'
import ModelList from '../components/model/ModelList'

const FEATURES = [
  {
    icon: <Layers className="w-5 h-5 text-indigo-400" />,
    bg: 'bg-indigo-500/10',
    title: 'Широкий каталог',
    desc: 'Тысячи 3D-моделей: OBJ, FBX, STL, GLTF, BLEND и другие форматы',
  },
  {
    icon: <Download className="w-5 h-5 text-emerald-400" />,
    bg: 'bg-emerald-500/10',
    title: 'Мгновенная загрузка',
    desc: 'Скачивайте сразу после оплаты — ссылка активна 72 часа',
  },
  {
    icon: <Shield className="w-5 h-5 text-violet-400" />,
    bg: 'bg-violet-500/10',
    title: 'Лицензионная защита',
    desc: 'Каждая покупка сопровождается лицензионным ключом',
  },
  {
    icon: <Star className="w-5 h-5 text-amber-400" />,
    bg: 'bg-amber-500/10',
    title: 'Проверенные авторы',
    desc: 'Все модели проходят модерацию перед публикацией',
  },
]

const CATEGORY_ACCENTS = [
  { border: 'hover:border-indigo-500/40', icon: '🏗️', glow: 'group-hover:text-indigo-400' },
  { border: 'hover:border-violet-500/40', icon: '👤', glow: 'group-hover:text-violet-400' },
  { border: 'hover:border-sky-500/40',    icon: '🚗', glow: 'group-hover:text-sky-400' },
  { border: 'hover:border-emerald-500/40',icon: '🌲', glow: 'group-hover:text-emerald-400' },
  { border: 'hover:border-amber-500/40',  icon: '🏠', glow: 'group-hover:text-amber-400' },
  { border: 'hover:border-rose-500/40',   icon: '⚙️', glow: 'group-hover:text-rose-400' },
  { border: 'hover:border-cyan-500/40',   icon: '🎮', glow: 'group-hover:text-cyan-400' },
  { border: 'hover:border-orange-500/40', icon: '✈️', glow: 'group-hover:text-orange-400' },
  { border: 'hover:border-pink-500/40',   icon: '🐾', glow: 'group-hover:text-pink-400' },
  { border: 'hover:border-teal-500/40',   icon: '💎', glow: 'group-hover:text-teal-400' },
]

/* ─── CSS 3D Cube ─── */
const Cube3D = () => (
  <div className="relative flex items-center justify-center w-64 h-64">
    {/* Glow orbs */}
    <div className="absolute inset-8 bg-indigo-600/25 rounded-full blur-3xl animate-glow pointer-events-none" />
    <div
      className="absolute inset-14 bg-violet-600/20 rounded-full blur-2xl animate-glow pointer-events-none"
      style={{ animationDelay: '1.5s' }}
    />

    {/* Perspective → fixed X tilt → Y rotation only */}
    <div style={{ perspective: '600px' }}>
      <div style={{ transformStyle: 'preserve-3d', transform: 'rotateX(18deg)' }}>
        <div
          className="relative w-32 h-32 animate-rotate-cube"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-slate-800/80 border border-indigo-500/60 flex items-center justify-center"
            style={{ transform: 'translateZ(64px)' }}
          >
            <Box className="w-8 h-8 text-indigo-400/70" />
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 bg-slate-900/80 border border-indigo-500/25"
            style={{ transform: 'rotateY(180deg) translateZ(64px)' }}
          />
          {/* Right */}
          <div
            className="absolute inset-0 bg-slate-800/60 border border-violet-500/50"
            style={{ transform: 'rotateY(90deg) translateZ(64px)' }}
          />
          {/* Left */}
          <div
            className="absolute inset-0 bg-slate-800/40 border border-violet-500/25"
            style={{ transform: 'rotateY(-90deg) translateZ(64px)' }}
          />
          {/* Top */}
          <div
            className="absolute inset-0 bg-indigo-950/60 border border-indigo-400/50"
            style={{ transform: 'rotateX(90deg) translateZ(64px)' }}
          />
          {/* Bottom */}
          <div
            className="absolute inset-0 bg-slate-950/80 border border-slate-600/30"
            style={{ transform: 'rotateX(-90deg) translateZ(64px)' }}
          />
        </div>
      </div>
    </div>

    {/* Floating format badges */}
    {[
      { label: '.OBJ',  cls: 'top-4 -right-8',        color: 'text-indigo-300', delay: '0s' },
      { label: '.FBX',  cls: 'bottom-10 -left-10',     color: 'text-violet-300', delay: '1.4s' },
      { label: '.GLTF', cls: 'bottom-4 right-2',       color: 'text-emerald-400', delay: '2.8s' },
      { label: '.STL',  cls: 'top-1/2 -left-12 -translate-y-1/2', color: 'text-amber-400', delay: '0.7s' },
    ].map(({ label, cls, color, delay }) => (
      <div
        key={label}
        className={`absolute ${cls} bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs font-bold ${color} animate-float shadow-lg backdrop-blur-sm`}
        style={{ animationDelay: delay }}
      >
        {label}
      </div>
    ))}
  </div>
)

/* ─── Page ─── */
const HomePage = () => {
  const [popularModels, setPopularModels] = useState([])
  const [categories, setCategories]       = useState([])
  const [loading, setLoading]             = useState(true)

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
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-16">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-slate-900 rounded-3xl px-8 py-20 lg:py-28 border border-slate-800">
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_60%_50%,rgba(99,102,241,0.12),transparent)] pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-700/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold px-4 py-2 rounded-full mb-6">
              <Zap className="w-3.5 h-3.5" />
              АРОО «РКС» — Маркетплейс 3D-моделей
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-white leading-[1.08] tracking-tight mb-5">
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
                className="inline-flex items-center gap-2 border border-slate-700 hover:border-slate-500 hover:bg-slate-800/50 text-slate-300 hover:text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200"
              >
                Стать автором
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 mt-10 justify-center lg:justify-start">
              {[
                { val: '10K+', label: 'Моделей' },
                { val: '500+', label: 'Авторов' },
                { val: '50K+', label: 'Покупок' },
              ].map(({ val, label }, i) => (
                <React.Fragment key={label}>
                  {i > 0 && <div className="w-px h-8 bg-slate-800" />}
                  <div>
                    <p className="text-2xl font-black text-white">{val}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{label}</p>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 3D Cube */}
          <div className="flex-shrink-0">
            <Cube3D />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 transition-all duration-300"
            >
              <div className={`w-11 h-11 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Категории</h2>
              <p className="text-slate-500 text-sm mt-0.5">Найдите нужную 3D-модель</p>
            </div>
            <Link
              to="/catalog"
              className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold flex items-center gap-1 transition-colors"
            >
              Все <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {categories.slice(0, 10).map((cat, i) => {
              const acc = CATEGORY_ACCENTS[i % CATEGORY_ACCENTS.length]
              return (
                <Link
                  key={cat.id}
                  to={`/catalog?category=${cat.slug}`}
                  className={`group flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-900 border border-slate-800 ${acc.border} hover:bg-slate-800/60 hover:-translate-y-0.5 transition-all duration-300`}
                >
                  <span className="text-2xl mb-2 transition-transform duration-300 group-hover:scale-110">
                    {acc.icon}
                  </span>
                  <span className={`text-xs font-semibold text-slate-400 text-center ${acc.glow} transition-colors`}>
                    {cat.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Popular Models ── */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Популярные модели</h2>
            <p className="text-slate-500 text-sm mt-0.5">Самые востребованные работы</p>
          </div>
          <Link
            to="/catalog?sort=popular"
            className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold flex items-center gap-1 transition-colors"
          >
            Смотреть все <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col animate-pulse">
                <div className="w-full aspect-square bg-slate-800 rounded-xl mb-3" />
                <div className="h-3.5 w-3/4 bg-slate-800 rounded-lg mb-2" />
                <div className="h-3.5 w-1/2 bg-slate-800/60 rounded-lg" />
              </div>
            ))}
          </div>
        ) : popularModels.length > 0 ? (
          <ModelList models={popularModels} />
        ) : (
          <div className="text-slate-500 text-center py-16 bg-slate-900 rounded-2xl border border-slate-800">
            Нет моделей для отображения
          </div>
        )}
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-12 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-white/20 pointer-events-none" />
        <div className="relative">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-2xl border border-white/15 mb-5">
            <Box className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white mb-3">
            Вы создаёте 3D-модели?
          </h3>
          <p className="text-indigo-200 mb-8 max-w-sm mx-auto">
            Станьте автором на платформе и начните зарабатывать на своих работах
          </p>
          <Link
            to="/author"
            className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-3.5 rounded-xl hover:bg-indigo-50 transition-colors shadow-xl shadow-indigo-950/40"
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
