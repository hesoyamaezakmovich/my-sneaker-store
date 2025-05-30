import React from 'react'
import Loader from '../common/Loader'

const Button = ({
  as: Component = 'button',
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  // Стили вариантов
  const variantStyles = {
    primary: 'bg-black text-white hover:bg-gray-800 focus:ring-black',
    secondary: 'bg-white text-black border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    ghost: 'bg-transparent text-black hover:bg-gray-100 focus:ring-gray-500',
    link: 'bg-transparent text-black hover:underline p-0'
  }

  // Стили размеров
  const sizeStyles = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2.5 text-base',
    large: 'px-6 py-3 text-lg'
  }

  // Базовые стили
  const baseStyles = `
    inline-flex items-center justify-center
    font-medium rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-95
  `

  // Стили для полной ширины
  const widthStyles = fullWidth ? 'w-full' : ''

  // Комбинируем все стили
  const combinedStyles = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${variant !== 'link' ? sizeStyles[size] : ''}
    ${widthStyles}
    ${className}
  `

  // Контент кнопки
  const content = (
    <>
      {loading && (
        <Loader size="small" color={variant === 'primary' ? 'white' : 'black'} />
      )}
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className={`w-5 h-5 ${children ? 'mr-2' : ''}`} />
      )}
      {children && <span>{children}</span>}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className={`w-5 h-5 ${children ? 'ml-2' : ''}`} />
      )}
    </>
  )

  // Если это button, прокидываем type, disabled, onClick
  // Если это Link или другой компонент, не прокидываем type/disabled
  const extraProps = Component === 'button'
    ? { type, disabled: disabled || loading, onClick }
    : { onClick }

  return (
    <Component
      className={combinedStyles}
      {...extraProps}
      {...props}
    >
      {content}
    </Component>
  )
}

// Компонент группы кнопок
export const ButtonGroup = ({ children, className = '' }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {children}
    </div>
  )
}

// Компонент иконки-кнопки
export const IconButton = ({
  icon: Icon,
  size = 'medium',
  variant = 'ghost',
  className = '',
  ...props
}) => {
  const sizeStyles = {
    small: 'p-1',
    medium: 'p-2',
    large: 'p-3'
  }

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  }

  return (
    <Button
      variant={variant}
      className={`${sizeStyles[size]} ${className}`}
      {...props}
    >
      <Icon className={iconSizes[size]} />
    </Button>
  )
}

export default Button