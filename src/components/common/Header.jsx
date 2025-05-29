import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, User } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useUserQuery } from '../../hooks/useUserQuery'
import { useFavoritesQuery } from '../../hooks/useFavoritesQuery'
import { useCartQuery } from '../../hooks/useCartQuery'
import AuthModal from '../auth/AuthModal'
import CartDrawer from '../cart/CartDrawer'

const Header = () => {
  const navigate = useNavigate()
  const { isAuthModalOpen, setIsAuthModalOpen } = useAuth() || {}

  const { data: user } = useUserQuery()
  const { data: favorites = [] } = useFavoritesQuery(user?.id)
  const { data: cartItems = [] } = useCartQuery(user?.id)
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0)

  const [isCartOpen, setIsCartOpen] = React.useState(false)

  const handleCheckout = () => {
    navigate('/checkout')
    setIsCartOpen(false)
  }

  const handleChangeQuantity = (item, newQuantity) => {
    // Реализация через useUpdateCartQuantity в компоненте CartDrawer
  }

  const handleRemove = (item) => {
    // Реализация через useRemoveFromCart в компоненте CartDrawer
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Логотип */}
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-extrabold text-2xl tracking-tight">S</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-gray-900 hidden sm:block">
              BRO'S <span className="text-black">SHOP</span>
            </span>
          </div>
          {/* Навигация и действия */}
          <nav className="flex items-center gap-8">
            <div className="relative cursor-pointer group" onClick={() => navigate('/favorites')}>
              <Heart className="w-7 h-7 text-gray-700 group-hover:text-red-500 transition" />
              {favorites.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 shadow-lg border-2 border-white">
                  {favorites.length}
                </span>
              )}
            </div>
            <div className="relative cursor-pointer group" onClick={() => {
              setIsCartOpen(true)
            }}>
              <ShoppingCart className="w-7 h-7 text-gray-700 group-hover:text-black transition" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full px-1.5 shadow-lg border-2 border-white">
                  {totalItems}
                </span>
              )}
            </div>
            <button
              className="flex items-center gap-2 text-gray-700 hover:text-black transition font-semibold px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 shadow-sm"
              onClick={() => user ? navigate('/profile') : setIsAuthModalOpen(true)}
            >
              <User className="w-6 h-6" />
              <span className="hidden sm:block">{user ? 'Профиль' : 'Войти'}</span>
            </button>
          </nav>
        </div>
      </header>
      <AuthModal />
      <CartDrawer 
        cartItems={cartItems}
        onChangeQuantity={handleChangeQuantity}
        onRemove={handleRemove}
        onCheckout={handleCheckout}
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  )
}

export default Header