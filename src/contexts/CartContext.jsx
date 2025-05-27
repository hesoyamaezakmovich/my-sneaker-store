import React, { createContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export const CartContext = createContext({})

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { user } = useAuth()

  // Загружаем корзину при входе пользователя
  useEffect(() => {
    if (user) {
      loadCart()
    } else {
      // Если пользователь вышел, загружаем корзину из localStorage
      loadLocalCart()
    }
  }, [user])

  // Сохраняем корзину в localStorage для неавторизованных пользователей
  useEffect(() => {
    if (!user && cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems))
    }
  }, [cartItems, user])

  // Загрузка корзины из базы данных
  const loadCart = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*),
          size:sizes(*)
        `)
        .eq('user_id', user.id)

      if (error) throw error

      setCartItems(data || [])
      
      // Синхронизируем с локальной корзиной
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]')
      if (localCart.length > 0) {
        await syncLocalCart(localCart)
        localStorage.removeItem('cart')
      }
    } catch (error) {
      console.error('Error loading cart:', error)
      toast.error('Ошибка загрузки корзины')
    } finally {
      setLoading(false)
    }
  }

  // Загрузка корзины из localStorage
  const loadLocalCart = () => {
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartItems(localCart)
  }

  // Синхронизация локальной корзины с базой данных
  const syncLocalCart = async (localCart) => {
    try {
      for (const item of localCart) {
        await addToCart(item.product_id, item.size_id, item.quantity)
      }
    } catch (error) {
      console.error('Error syncing cart:', error)
    }
  }

  // Добавление товара в корзину
  const addToCart = async (productId, sizeId, quantity = 1) => {
    try {
      if (user) {
        // Для авторизованных пользователей
        // Проверяем, есть ли уже такой товар в корзине
        const existingItem = cartItems.find(
          item => item.product_id === productId && item.size_id === sizeId
        )

        if (existingItem) {
          // Обновляем количество
          await updateQuantity(existingItem.id, existingItem.quantity + quantity)
        } else {
          // Добавляем новый товар
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
              product:products(*),
              size:sizes(*)
            `)
            .single()

          if (error) throw error
          
          setCartItems([...cartItems, data])
        }
      } else {
        // Для неавторизованных пользователей
        // Сначала нужно получить информацию о товаре
        const { data: product } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single()

        const { data: size } = await supabase
          .from('sizes')
          .select('*')
          .eq('id', sizeId)
          .single()

        const existingItem = cartItems.find(
          item => item.product_id === productId && item.size_id === sizeId
        )

        if (existingItem) {
          const updatedItems = cartItems.map(item =>
            item.product_id === productId && item.size_id === sizeId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
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
          setCartItems([...cartItems, newItem])
        }
      }

      toast.success('Товар добавлен в корзину')
      setIsCartOpen(true)
    } catch (error) {
      console.error('Error adding to cart:', error)
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

      const updatedItems = cartItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
      setCartItems(updatedItems)
    } catch (error) {
      console.error('Error updating quantity:', error)
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

      const updatedItems = cartItems.filter(item => item.id !== itemId)
      setCartItems(updatedItems)
      toast.success('Товар удален из корзины')
    } catch (error) {
      console.error('Error removing from cart:', error)
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
      console.error('Error clearing cart:', error)
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