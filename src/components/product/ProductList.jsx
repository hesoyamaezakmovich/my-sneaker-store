import React from 'react'
import ProductCard from './ProductCard'

const ProductList = ({ products, onAddToCart, onToggleFavorite, favorites }) => {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-8">
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
