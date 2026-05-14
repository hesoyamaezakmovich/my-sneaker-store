import React from 'react'

const Loader = ({
  size       = 'medium',
  color      = 'white',
  fullScreen = false,
  text       = '',
}) => {
  const sizeClasses = {
    small:  'w-5 h-5 border-2',
    medium: 'w-9 h-9 border-2',
    large:  'w-14 h-14 border-3',
  }
  const colorClasses = {
    white:   'border-slate-700 border-t-white',
    primary: 'border-slate-700 border-t-indigo-500',
    black:   'border-slate-600 border-t-slate-200',
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClasses[size]} ${colorClasses[color] || colorClasses.white} rounded-full animate-spin`} />
      {text && <p className="text-slate-400 text-sm">{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}

export const Skeleton = ({ className = '', ...props }) => (
  <div className={`animate-pulse bg-slate-800 rounded-xl ${className}`} {...props} />
)

export const ProductSkeleton = () => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
    <Skeleton className="w-full aspect-square" />
    <div className="p-4 space-y-2">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-8 w-24" />
    </div>
  </div>
)

export const ListSkeleton = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
)

export const TextSkeleton = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className="h-3" style={{ width: `${Math.random() * 40 + 60}%` }} />
    ))}
  </div>
)

export default Loader
