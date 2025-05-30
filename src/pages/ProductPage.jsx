import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ProductDetails from '../components/product/ProductDetails'
import { fetchProductById, fetchSimilarProducts } from '../services/products.service'
import { useAuth } from '../hooks/useAuth'
import { useAddToCart } from '../hooks/useCartMutations'
import Button from '../components/ui/Button'
import { useUserQuery } from '../hooks/useUserQuery'
import ProductList from '../components/product/ProductList'

const ProductPage = () => {
  const { id } = useParams()
  const { setIsAuthModalOpen } = useAuth()
  const { data: user } = useUserQuery()
  const addToCartMutation = useAddToCart(user?.id)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [similar, setSimilar] = useState([])
  const [similarLoading, setSimilarLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchProductById(id)
      .then(setProduct)
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!product) return
    setSimilarLoading(true)
    fetchSimilarProducts(product.category_id, product.id, 4)
      .then(setSimilar)
      .finally(() => setSimilarLoading(false))
  }, [product])

  const handleAddToCart = async (product, sizeId) => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    
    try {
      await addToCartMutation.mutateAsync({ productId: product.id, sizeId, quantity: 1 })
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-8">Загрузка...</div>
  }
  if (!product) {
    return <div className="max-w-5xl mx-auto px-4 py-8">Товар не найден</div>
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <ProductDetails product={product} onAddToCart={handleAddToCart} />

      {/* Similar products */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Похожие товары</h2>
        {similarLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1,2,3,4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-gray-300 text-4xl">👟</span>
                </div>
                <div className="h-4 w-20 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-4 w-12 bg-gray-100 rounded mb-2 animate-pulse" />
                <Button size="small" variant="secondary" className="mt-2 w-full">
                  Подробнее
                </Button>
              </div>
            ))}
          </div>
        ) : similar.length > 0 ? (
          <ProductList products={similar} />
        ) : (
          <div className="text-gray-500">Нет похожих товаров</div>
        )}
      </section>
    </div>
  )
}

export default ProductPage