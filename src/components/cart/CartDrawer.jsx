import React from 'react'
import CartItem from './CartItem'
import CartSummary from './CartSummary'
import { ShoppingCart, X } from 'lucide-react'
import { useCartQuery } from '../../hooks/useCartQuery'
import { Link } from 'react-router-dom'

const CartDrawer = ({ open, onClose, onCheckout }) => {
  const { data: cartItems = [] } = useCartQuery()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">
              Корзина {cartItems.length > 0 && `(${cartItems.length})`}
            </h2>
            <button onClick={onClose} className="p-2 -m-2 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Корзина пуста</h3>
                <p className="text-gray-500 mb-6 text-sm">Добавьте 3D-модели для оформления заказа</p>
                <Link
                  to="/catalog"
                  onClick={onClose}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-blue-700 transition-colors text-sm"
                >
                  В каталог
                </Link>
              </div>
            ) : (
              <div className="p-5">
                {cartItems.map((item) => (
                  <CartItem key={item.id} cartItem={item} />
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t border-gray-100 p-5">
              <CartSummary cartItems={cartItems} onCheckout={onCheckout} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default CartDrawer
