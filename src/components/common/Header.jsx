import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, User, Box } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useUserQuery } from '../../hooks/useUserQuery'
import { useFavoritesQuery } from '../../hooks/useFavoritesQuery'
import { useCartQuery } from '../../hooks/useCartQuery'
import AuthModal from '../auth/AuthModal'
import CartDrawer from '../cart/CartDrawer'

const Header = () => {
  const navigate = useNavigate()
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
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Логотип */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <Box className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-extrabold tracking-tight text-gray-900">РКС</span>
              <span className="text-xs text-gray-400 block leading-none">3D Маркетплейс</span>
            </div>
          </div>

          {/* Навигация */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <button onClick={() => navigate('/catalog')} className="hover:text-blue-600 transition-colors">
              Каталог
            </button>
            <button onClick={() => navigate('/author')} className="hover:text-blue-600 transition-colors">
              Кабинет автора
            </button>
            <button onClick={() => navigate('/about')} className="hover:text-blue-600 transition-colors">
              О нас
            </button>
          </nav>

          {/* Иконки действий */}
          <div className="flex items-center gap-3">
            <button
              className="relative p-2 text-gray-600 hover:text-red-500 transition-colors"
              onClick={() => navigate('/favorites')}
              aria-label="Избранное"
            >
              <Heart className="w-6 h-6" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {favorites.length > 9 ? '9+' : favorites.length}
                </span>
              )}
            </button>

            <button
              className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
              onClick={() => setIsCartOpen(true)}
              aria-label="Корзина"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            <button
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-semibold px-4 py-2 rounded-full bg-gray-100 hover:bg-blue-50 text-sm"
              onClick={() => user ? navigate('/profile') : setIsAuthModalOpen(true)}
            >
              <User className="w-5 h-5" />
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
