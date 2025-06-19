import React from 'react'
import CartItem from './CartItem'
import CartSummary from './CartSummary'
import { ShoppingCart, X } from 'lucide-react'
import { useUserQuery } from '../../hooks/useUserQuery'
import { useCartQuery } from '../../hooks/useCartQuery'
import { useUpdateCartQuantity, useRemoveFromCart } from '../../hooks/useCartMutations'

const CartDrawer = ({ open, onClose, onCheckout }) => {
  const { data: user } = useUserQuery()
  const { data: cartItems = [] } = useCartQuery(user?.id)
  const updateQuantityMutation = useUpdateCartQuantity(user?.id)
  const removeFromCartMutation = useRemoveFromCart(user?.id)

  const handleChangeQuantity = (cartItem, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCartMutation.mutate(cartItem.id)
    } else {
      updateQuantityMutation.mutate({ itemId: cartItem.id, quantity: newQuantity })
    }
  }

  const handleRemove = (cartItem) => {
    removeFromCartMutation.mutate(cartItem.id)
  }

  return (
    <>
      {/* Оверлей */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Боковая панель корзины */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Заголовок */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Корзина {cartItems.length > 0 && `(${cartItems.length})`}
            </h2>
            <button
              onClick={onClose}
              className="p-2 -m-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Содержимое корзины */}
          <div className="flex-1 overflow-y-auto">
            {cartItems.length === 0 ? (
              // Пустая корзина
              <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ваша корзина пуста
                </h3>
                <p className="text-gray-500 mb-6">
                  Добавьте товары, чтобы оформить заказ
                </p>
                <button
                  className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                  onClick={onClose}
                >
                  Перейти в каталог
                </button>
              </div>
            ) : (
              // Список товаров
              <div className="p-6">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    cartItem={item}
                    onChangeQuantity={handleChangeQuantity}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Итого и кнопка оформления */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-6">
              <CartSummary cartItems={cartItems} onCheckout={onCheckout} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default CartDrawer