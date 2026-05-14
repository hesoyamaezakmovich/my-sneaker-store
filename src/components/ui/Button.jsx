import React from 'react'
import Loader from '../common/Loader'

const Button = ({
  as: Component = 'button',
  children,
  variant      = 'primary',
  size         = 'medium',
  fullWidth    = false,
  loading      = false,
  disabled     = false,
  icon: Icon,
  iconPosition = 'left',
  className    = '',
  onClick,
  type         = 'button',
  ...props
}) => {
  const variantStyles = {
    primary:   'bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500 shadow-sm shadow-indigo-950/40',
    secondary: 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white focus:ring-slate-600',
    danger:    'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500',
    success:   'bg-emerald-600 text-white hover:bg-emerald-500 focus:ring-emerald-500',
    ghost:     'bg-transparent text-slate-400 hover:bg-slate-800/70 hover:text-white focus:ring-slate-600',
    link:      'bg-transparent text-indigo-400 hover:text-indigo-300 p-0 shadow-none',
  }

  const sizeStyles = {
    small:  'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2.5 text-sm',
    large:  'px-6 py-3 text-base',
  }

  const base = `
    inline-flex items-center justify-center gap-2
    font-semibold rounded-xl
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950
    disabled:opacity-40 disabled:cursor-not-allowed
    active:scale-95
  `

  const combined = `
    ${base}
    ${variantStyles[variant] || variantStyles.primary}
    ${variant !== 'link' ? sizeStyles[size] : ''}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `

  const content = (
    <>
      {loading && <Loader size="small" color="white" />}
      {!loading && Icon && iconPosition === 'left'  && <Icon className={`w-4 h-4 ${children ? 'mr-1' : ''}`} />}
      {children && <span>{children}</span>}
      {!loading && Icon && iconPosition === 'right' && <Icon className={`w-4 h-4 ${children ? 'ml-1' : ''}`} />}
    </>
  )

  const extraProps = Component === 'button'
    ? { type, disabled: disabled || loading, onClick }
    : { onClick }

  return (
    <Component className={combined} {...extraProps} {...props}>
      {content}
    </Component>
  )
}

export const ButtonGroup = ({ children, className = '' }) => (
  <div className={`flex items-center gap-2 ${className}`}>{children}</div>
)

export const IconButton = ({ icon: Icon, size = 'medium', variant = 'ghost', className = '', ...props }) => {
  const sizeStyles = { small: 'p-1', medium: 'p-2', large: 'p-3' }
  const iconSizes  = { small: 'w-4 h-4', medium: 'w-5 h-5', large: 'w-6 h-6' }

  return (
    <Button variant={variant} className={`${sizeStyles[size]} ${className}`} {...props}>
      <Icon className={iconSizes[size]} />
    </Button>
  )
}

export default Button
