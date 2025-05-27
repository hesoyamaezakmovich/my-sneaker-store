import React, { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const sizeStyles = {
  small: 'px-3 py-1.5 text-sm',
  medium: 'px-4 py-2 text-base',
  large: 'px-5 py-3 text-lg'
}

const Input = forwardRef(
  (
    {
      label,
      error,
      helper,
      icon: Icon,
      type = 'text',
      required = false,
      fullWidth = true,
      className = '',
      inputClassName = '',
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword && showPassword ? 'text' : type

    const baseStyles = `
      w-full px-4 py-2.5 
      border rounded-lg
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:bg-gray-50 disabled:cursor-not-allowed
    `

    const stateStyles = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-black focus:ring-black hover:border-gray-400'

    const iconStyles = Icon || isPassword ? 'pl-10' : ''

    const combinedInputStyles = `
      ${baseStyles}
      ${stateStyles}
      ${iconStyles}
      ${inputClassName}
    `

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          )}

          <input
            ref={ref}
            type={inputType}
            className={combinedInputStyles}
            required={required}
            disabled={disabled}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-gray-400" />
              ) : (
                <Eye className="w-5 h-5 text-gray-400" />
              )}
            </button>
          )}
        </div>

        {(error || helper) && (
          <p className={`mt-1.5 text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
            {error || helper}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export const Textarea = forwardRef(({
  label,
  error,
  helper,
  required = false,
  fullWidth = true,
  className = '',
  textareaClassName = '',
  rows = 4,
  ...props
}, ref) => {
  const baseStyles = `
    w-full px-4 py-2.5 
    border rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:bg-gray-50 disabled:cursor-not-allowed
    resize-none
  `

  const stateStyles = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-black focus:ring-black hover:border-gray-400'

  const combinedStyles = `
    ${baseStyles}
    ${stateStyles}
    ${textareaClassName}
  `

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        rows={rows}
        className={combinedStyles}
        required={required}
        {...props}
      />

      {(error || helper) && (
        <p className={`mt-1.5 text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
          {error || helper}
        </p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

export const Select = forwardRef(({
  label,
  error,
  helper,
  options = [],
  placeholder = 'Выберите...',
  required = false,
  fullWidth = true,
  className = '',
  selectClassName = '',
  ...props
}, ref) => {
  const baseStyles = `
    w-full px-4 py-2.5 
    border rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:bg-gray-50 disabled:cursor-not-allowed
    appearance-none
    bg-white
  `

  const stateStyles = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-black focus:ring-black hover:border-gray-400'

  const combinedStyles = `
    ${baseStyles}
    ${stateStyles}
    ${selectClassName}
  `

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          className={combinedStyles}
          required={required}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {/* Стрелка для select */}
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/></svg>
        </span>
      </div>

      {(error || helper) && (
        <p className={`mt-1.5 text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
          {error || helper}
        </p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Input
