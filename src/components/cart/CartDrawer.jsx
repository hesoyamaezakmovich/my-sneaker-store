import React from 'react'
import { ShoppingCart, X, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import CartItem from './CartItem'
import CartSummary from './CartSummary'
import { useCartQuery } from '../../hooks/useCartQuery'

const CartDrawer = ({ open, onClose, onCheckout }) => {
  const { data: cartItems = [] } = useCartQuery()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-[420px] bg-slate-900 border-l border-slate-800 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">
            Корзина {cartItems.length > 0 && <span className="text-slate-500 font-normal text-sm">({cartItems.length})</span>}
          </h2>
          <button
            onClick={onClose}
            className="p-2 -m-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            style={{ boxShadow: 'none' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-5 border border-slate-700">
                <ShoppingCart className="w-10 h-10 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Корзина пуста</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-[220px]">
                Добавьте 3D-модели из каталога, чтобы оформить заказ
              </p>
              <Link
                to="/catalog"
                onClick={onClose}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-3 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-indigo-950/40"
              >
                Перейти в каталог <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="p-5 space-y-1">
              {cartItems.map(item => <CartItem key={item.id} cartItem={item} />)}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-slate-800 p-5">
            <CartSummary cartItems={cartItems} onCheckout={onCheckout} />
          </div>
        )}
      </div>
    </>
  )
}

export default CartDrawer
