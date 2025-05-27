import React from 'react'
import ProductCard from './ProductCard'

const ProductList = ({ products, onAddToCart, onToggleFavorite, favorites }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onToggleFavorite={onToggleFavorite}
          isFavorite={favorites?.some(fav => fav.product_id === product.id)}
        />
      ))}
    </div>
  )
}

export default ProductList
