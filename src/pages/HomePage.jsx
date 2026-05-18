import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
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

/* ─── Reusable scroll-reveal wrapper ─── */
const FadeUp = ({ children, delay = 0, className = '' }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
  >
    {children}
  </motion.div>
)

/* ─── Animated counter ─── */
const CountUp = ({ target, suffix }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let current = 0
    const duration = 1400
    const steps = 60
    const increment = target / steps
    const interval = duration / steps
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, interval)
    return () => clearInterval(timer)
  }, [isInView, target])

  return <span ref={ref}>{count}{suffix}</span>
}

// Quaternion helpers — no gimbal lock
const qMul = (a, b) => [
  a[0]*b[0] - a[1]*b[1] - a[2]*b[2] - a[3]*b[3],
  a[0]*b[1] + a[1]*b[0] + a[2]*b[3] - a[3]*b[2],
  a[0]*b[2] - a[1]*b[3] + a[2]*b[0] + a[3]*b[1],
  a[0]*b[3] + a[1]*b[2] - a[2]*b[1] + a[3]*b[0],
]
const qNorm = (q) => {
  const len = Math.sqrt(q[0]**2 + q[1]**2 + q[2]**2 + q[3]**2)
  return q.map(v => v / len)
}
const qToMatrix3d = ([w, x, y, z]) =>
  `matrix3d(${1-2*(y*y+z*z)},${2*(x*y+w*z)},${2*(x*z-w*y)},0,` +
  `${2*(x*y-w*z)},${1-2*(x*x+z*z)},${2*(y*z+w*x)},0,` +
  `${2*(x*z+w*y)},${2*(y*z-w*x)},${1-2*(x*x+y*y)},0,` +
  `0,0,0,1)`

/* ─── CSS 3D Cube (draggable, quaternion-based) ─── */
const Cube3D = () => {
  const wrapRef  = useRef(null)
  const dragging = useRef(false)
  const lastPos  = useRef({ x: 0, y: 0 })
  const rafId    = useRef(null)
  const [grab, setGrab] = useState(false)
  // Initial quaternion: 18° tilt around X axis
  const a0 = 18 * Math.PI / 180
  const qRef = useRef([Math.cos(a0/2), Math.sin(a0/2), 0, 0])

  useEffect(() => {
    // Auto-rotate ~18°/s around world Y axis
    const AUTO = 0.3 * Math.PI / 180
    const autoQ = [Math.cos(AUTO/2), 0, Math.sin(AUTO/2), 0]
    if (wrapRef.current)
      wrapRef.current.style.transform = qToMatrix3d(qRef.current)
    const tick = () => {
      if (!dragging.current) {
        qRef.current = qNorm(qMul(autoQ, qRef.current))
        if (wrapRef.current)
          wrapRef.current.style.transform = qToMatrix3d(qRef.current)
      }
      rafId.current = requestAnimationFrame(tick)
    }
    rafId.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId.current)
  }, [])

  const onPointerDown = (e) => {
    dragging.current = true
    setGrab(true)
    lastPos.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e) => {
    if (!dragging.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    lastPos.current = { x: e.clientX, y: e.clientY }
    const dist = Math.sqrt(dx*dx + dy*dy)
    if (dist < 0.5) return
    // Axis perpendicular to drag direction in screen space
    const ax = -dy / dist
    const ay =  dx / dist
    const angle = dist * 0.01
    const s = Math.sin(angle / 2)
    const dq = [Math.cos(angle / 2), ax*s, ay*s, 0]
    // World-space rotation: left-multiply so response matches screen
    qRef.current = qNorm(qMul(dq, qRef.current))
    if (wrapRef.current)
      wrapRef.current.style.transform = qToMatrix3d(qRef.current)
  }

  const onPointerUp = () => {
    dragging.current = false
    setGrab(false)
  }

  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* Glow orbs */}
      <div className="absolute inset-8 bg-indigo-600/25 rounded-full blur-3xl animate-glow pointer-events-none" />
      <div
        className="absolute inset-14 bg-violet-600/20 rounded-full blur-2xl animate-glow pointer-events-none"
        style={{ animationDelay: '1.5s' }}
      />

      {/* Perspective container — drag target */}
      <div
        style={{ perspective: '600px', cursor: grab ? 'grabbing' : 'grab' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div
          ref={wrapRef}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="relative w-32 h-32" style={{ transformStyle: 'preserve-3d' }}>
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
}

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
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.span
              className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold px-4 py-2 rounded-full mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Zap className="w-3.5 h-3.5" />
              АРОО «РКС» — Маркетплейс 3D-моделей
            </motion.span>

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

            <motion.div
              className="flex flex-wrap gap-3 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
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
            </motion.div>

            {/* Stats with CountUp */}
            <motion.div
              className="flex items-center gap-8 mt-10 justify-center lg:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              {[
                { target: 10, suffix: 'K+', label: 'Моделей' },
                { target: 500, suffix: '+', label: 'Авторов' },
                { target: 50, suffix: 'K+', label: 'Покупок' },
              ].map(({ target, suffix, label }, i) => (
                <React.Fragment key={label}>
                  {i > 0 && <div className="w-px h-8 bg-slate-800" />}
                  <div>
                    <p className="text-2xl font-black text-white">
                      <CountUp target={target} suffix={suffix} />
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">{label}</p>
                  </div>
                </React.Fragment>
              ))}
            </motion.div>
          </motion.div>

          {/* 3D Cube */}
          <motion.div
            className="flex-shrink-0"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <Cube3D />
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <FadeUp key={f.title} delay={i * 0.08}>
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 transition-all duration-300 h-full">
                <div className={`w-11 h-11 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <section>
          <FadeUp>
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
          </FadeUp>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {categories.slice(0, 10).map((cat, i) => {
              const acc = CATEGORY_ACCENTS[i % CATEGORY_ACCENTS.length]
              return (
                <FadeUp key={cat.id} delay={i * 0.05}>
                  <Link
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
                </FadeUp>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Popular Models ── */}
      <FadeUp>
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
      </FadeUp>

      {/* ── CTA ── */}
      <FadeUp>
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
      </FadeUp>

    </div>
  )
}

export default HomePage
