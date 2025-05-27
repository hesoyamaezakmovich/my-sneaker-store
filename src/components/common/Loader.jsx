import React from 'react'

const Loader = ({ 
  size = 'medium', 
  color = 'black', 
  fullScreen = false,
  text = ''
}) => {
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-10 h-10 border-3',
    large: 'w-16 h-16 border-4'
  }

  const colorClasses = {
    black: 'border-gray-200 border-t-black',
    white: 'border-gray-400 border-t-white',
    primary: 'border-gray-200 border-t-blue-600'
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]} 
          border-solid rounded-full animate-spin
        `}
      />
      {text && (
        <p className="mt-4 text-gray-600 text-sm font-medium">{text}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}

// Компонент скелетона для загрузки контента
export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      {...props}
    />
  )
}

// Компонент для загрузки списка товаров
export const ProductSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Skeleton className="w-full h-64" />
      <div className="p-4">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  )
}

// Компонент для загрузки списка
export const ListSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4">
          <Skeleton className="h-20 w-20 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Компонент для загрузки текста
export const TextSkeleton = ({ lines = 3 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-4"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  )
}

export default Loader