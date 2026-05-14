import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, Heart, User, Box } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useUserQuery } from '../../hooks/useUserQuery'
import { useFavoritesQuery } from '../../hooks/useFavoritesQuery'
import { useCartQuery } from '../../hooks/useCartQuery'
import AuthModal from '../auth/AuthModal'
import CartDrawer from '../cart/CartDrawer'

const NAV_LINKS = [
  { label: 'Каталог', path: '/catalog' },
  { label: 'Авторам', path: '/author' },
  { label: 'О нас', path: '/about' },
]

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { setIsAuthModalOpen } = useAuth() || {}

  const { data: user } = useUserQuery()
  const { data: favorites = [] } = useFavoritesQuery()
  const { data: cartItems = [] } = useCartQuery()
  const totalItems = cartItems.length

  const [isCartOpen, setIsCartOpen] = React.useState(false)

  const handleCheckout = () => {
    navigate('/checkout')
    setIsCartOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-gray-100/80 shadow-sm shadow-gray-100/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">

          {/* Logo */}
          <button
            className="flex items-center gap-3 select-none group"
            onClick={() => navigate('/')}
            style={{ background: 'none', boxShadow: 'none', padding: 0 }}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
              <Box className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block leading-none">
              <span className="text-lg font-black tracking-tight text-gray-900">РКС</span>
              <span className="text-[10px] text-gray-400 block mt-px">3D Маркетплейс</span>
            </div>
          </button>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, path }) => {
              const active = location.pathname === path
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  style={{ boxShadow: 'none' }}
                >
                  {label}
                </button>
              )
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Favorites */}
            <button
              className="relative p-2.5 text-gray-500 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-200"
              onClick={() => navigate('/favorites')}
              aria-label="Избранное"
              style={{ boxShadow: 'none' }}
            >
              <Heart className="w-5 h-5" />
              {favorites.length > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                  {favorites.length > 9 ? '9+' : favorites.length}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              className="relative p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200"
              onClick={() => setIsCartOpen(true)}
              aria-label="Корзина"
              style={{ boxShadow: 'none' }}
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-indigo-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            {/* Profile */}
            <button
              className="ml-1 flex items-center gap-2 text-gray-700 font-semibold pl-3 pr-4 py-2 rounded-xl bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 text-sm transition-all duration-200"
              onClick={() => user ? navigate('/profile') : setIsAuthModalOpen(true)}
              style={{ boxShadow: 'none' }}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:block">{user ? 'Профиль' : 'Войти'}</span>
            </button>
          </div>
        </div>
      </header>

      <AuthModal />
      <CartDrawer
        cartItems={cartItems}
        onCheckout={handleCheckout}
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  )
}

export default Header
