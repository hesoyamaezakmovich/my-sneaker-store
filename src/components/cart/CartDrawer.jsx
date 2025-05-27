import React from 'react'
import CartItem from './CartItem'
import CartSummary from './CartSummary'
import { ShoppingCart } from 'lucide-react'

const CartDrawer = ({ cartItems = [], onChangeQuantity, onRemove, onCheckout, open, onClose }) => {
  return (
    <div className={`fixed inset-0 z-50 transition ${open ? '' : 'pointer-events-none'}`}>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white rounded-l-3xl shadow-2xl transform transition-transform duration-300
          ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-extrabold tracking-tight">Корзина</h2>
          <button className="text-gray-400 hover:text-black text-3xl font-bold rounded-full p-1 transition-colors" onClick={onClose}>&times;</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-72 text-gray-400">
              <ShoppingCart className="w-16 h-16 mb-4" />
              <div className="text-lg mb-2">Ваша корзина пуста</div>
              <button className="mt-4 bg-black text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-800 transition" onClick={onClose}>
                Перейти в каталог
              </button>
            </div>
          ) : (
            cartItems.map(item => (
              <CartItem
                key={item.id}
                cartItem={item}
                onChangeQuantity={onChangeQuantity}
                onRemove={onRemove}
              />
            ))
          )}
        </div>
        <div className="p-6 border-t border-gray-100">
          <CartSummary cartItems={cartItems} onCheckout={onCheckout} />
        </div>
      </aside>
    </div>
  )
}

export default CartDrawer
