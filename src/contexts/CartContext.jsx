import React, { createContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export const CartContext = createContext({})

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { user, loading: authLoading } = useAuth()

  // Загружаем корзину только когда пользователь точно определен
  useEffect(() => {
    if (authLoading) return // Ждем завершения проверки авторизации
    
    if (user) {
      loadCart()
    } else {
      loadLocalCart()
    }
  }, [user, authLoading])

  // Сохраняем корзину в localStorage для неавторизованных пользователей
  useEffect(() => {
    if (!authLoading && !user && cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems))
    }
  }, [cartItems, user, authLoading])

  // Загрузка корзины из базы данных
  const loadCart = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      console.log('CartContext: Loading cart for user:', user.id)
      
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*, brand:brands(*), category:categories(*), images:product_images(*)),
          size:sizes(*)
        `)
        .eq('user_id', user.id)

      if (error) throw error

      setCartItems(data || [])
      console.log('CartContext: Cart loaded, items count:', data?.length || 0)
      
      // Синхронизируем с локальной корзиной только один раз
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]')
      if (localCart.length > 0) {
        console.log('CartContext: Syncing local cart:', localCart.length, 'items')
        await syncLocalCart(localCart)
        localStorage.removeItem('cart')
        // Перезагружаем корзину после синхронизации
        const { data: updatedData } = await supabase
          .from('cart_items')
          .select(`
            *,
            product:products(*, brand:brands(*), category:categories(*), images:product_images(*)),
            size:sizes(*)
          `)
          .eq('user_id', user.id)
        setCartItems(updatedData || [])
      }
    } catch (error) {
      console.error('CartContext: Error loading cart:', error)
      // Не показываем toast при каждой ошибке
    } finally {
      setLoading(false)
    }
  }

  // Загрузка корзины из localStorage
  const loadLocalCart = () => {
    try {
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartItems(localCart)
      console.log('CartContext: Local cart loaded, items count:', localCart.length)
    } catch (error) {
      console.error('CartContext: Error loading local cart:', error)
      setCartItems([])
    }
  }

  // Синхронизация локальной корзины с базой данных
  const syncLocalCart = async (localCart) => {
    if (!user || !localCart.length) return
    
    try {
      console.log('CartContext: Syncing local cart with database')
      
      for (const item of localCart) {
        // Проверяем, есть ли уже такой товар в корзине
        const { data: existing } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id)
          .eq('product_id', item.product_id)
          .eq('size_id', item.size_id)
          .single()

        if (existing) {
          // Обновляем количество
          await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + item.quantity })
            .eq('id', existing.id)
        } else {
          // Добавляем новый товар
          await supabase
            .from('cart_items')
            .insert({
              user_id: user.id,
              product_id: item.product_id,
              size_id: item.size_id,
              quantity: item.quantity
            })
        }
      }
      
      console.log('CartContext: Local cart synced successfully')
    } catch (error) {
      console.error('CartContext: Error syncing cart:', error)
    }
  }

  // Добавление товара в корзину
  const addToCart = async (productId, sizeId, quantity = 1) => {
    try {
      console.log('CartContext: Adding to cart:', { productId, sizeId, quantity })
      
      if (user) {
        // Для авторизованных пользователей
        const existingItem = cartItems.find(
          item => item.product_id === productId && item.size_id === sizeId
        )

        if (existingItem) {
          await updateQuantity(existingItem.id, existingItem.quantity + quantity)
        } else {
          const { data, error } = await supabase
            .from('cart_items')
            .insert({
              user_id: user.id,
              product_id: productId,
              size_id: sizeId,
              quantity
            })
            .select(`
              *,
              product:products(*, brand:brands(*), category:categories(*), images:product_images(*)),
              size:sizes(*)
            `)
            .single()

          if (error) throw error
          
          setCartItems(prev => [...prev, data])
        }
      } else {
        // Для неавторизованных пользователей
        const { data: product } = await supabase
          .from('products')
          .select('*, brand:brands(*), category:categories(*), images:product_images(*)')
          .eq('id', productId)
          .single()

        const { data: size } = await supabase
          .from('sizes')
          .select('*')
          .eq('id', sizeId)
          .single()

        const existingItemIndex = cartItems.findIndex(
          item => item.product_id === productId && item.size_id === sizeId
        )

        if (existingItemIndex !== -1) {
          const updatedItems = [...cartItems]
          updatedItems[existingItemIndex].quantity += quantity
          setCartItems(updatedItems)
        } else {
          const newItem = {
            id: Date.now(), // Временный ID
            product_id: productId,
            size_id: sizeId,
            quantity,
            product,
            size
          }
          setCartItems(prev => [...prev, newItem])
        }
      }

      toast.success('Товар добавлен в корзину')
      setIsCartOpen(true)
    } catch (error) {
      console.error('CartContext: Error adding to cart:', error)
      toast.error('Ошибка добавления в корзину')
    }
  }

  // Обновление количества товара
  const updateQuantity = async (itemId, quantity) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(itemId)
        return
      }

      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', itemId)
          .eq('user_id', user.id)

        if (error) throw error
      }

      setCartItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ))
    } catch (error) {
      console.error('CartContext: Error updating quantity:', error)
      toast.error('Ошибка обновления количества')
    }
  }

  // Удаление товара из корзины
  const removeFromCart = async (itemId) => {
    try {
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId)
          .eq('user_id', user.id)

        if (error) throw error
      }

      setCartItems(prev => prev.filter(item => item.id !== itemId))
      toast.success('Товар удален из корзины')
    } catch (error) {
      console.error('CartContext: Error removing from cart:', error)
      toast.error('Ошибка удаления из корзины')
    }
  }

  // Очистка корзины
  const clearCart = async () => {
    try {
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)

        if (error) throw error
      }

      setCartItems([])
      localStorage.removeItem('cart')
      toast.success('Корзина очищена')
    } catch (error) {
      console.error('CartContext: Error clearing cart:', error)
      toast.error('Ошибка очистки корзины')
    }
  }

  // Получение общей суммы
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity
    }, 0)
  }

  // Получение общего количества товаров
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  // Проверка наличия товара в корзине
  const isInCart = (productId, sizeId) => {
    return cartItems.some(
      item => item.product_id === productId && item.size_id === sizeId
    )
  }

  // Получение товара из корзины
  const getCartItem = (productId, sizeId) => {
    return cartItems.find(
      item => item.product_id === productId && item.size_id === sizeId
    )
  }

  const value = {
    cartItems,
    loading,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems,
    isInCart,
    getCartItem,
    loadCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}