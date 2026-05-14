import React, { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

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
    const isPassword  = type === 'password'
    const inputType   = isPassword && showPassword ? 'text' : type

    const base = `
      w-full px-4 py-2.5 bg-slate-800 border rounded-xl
      text-white placeholder-slate-500
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:bg-slate-900 disabled:text-slate-600 disabled:cursor-not-allowed
    `
    const state = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500 hover:border-slate-600'

    const withIcon = Icon || isPassword ? 'pl-10' : ''

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        {label && (
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
          )}

          <input
            ref={ref}
            type={inputType}
            className={`${base} ${state} ${withIcon} ${inputClassName}`}
            required={required}
            disabled={disabled}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700 rounded-lg transition-colors"
              style={{ boxShadow: 'none' }}
            >
              {showPassword
                ? <EyeOff className="w-4 h-4 text-slate-500" />
                : <Eye    className="w-4 h-4 text-slate-500" />
              }
            </button>
          )}
        </div>

        {(error || helper) && (
          <p className={`mt-1.5 text-xs ${error ? 'text-red-400' : 'text-slate-500'}`}>
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
  required  = false,
  fullWidth = true,
  className = '',
  textareaClassName = '',
  rows = 4,
  ...props
}, ref) => {
  const base = `
    w-full px-4 py-2.5 bg-slate-800 border rounded-xl
    text-white placeholder-slate-500
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:bg-slate-900 disabled:cursor-not-allowed
    resize-none
  `
  const state = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500 hover:border-slate-600'

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-slate-400 mb-1.5">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        rows={rows}
        className={`${base} ${state} ${textareaClassName}`}
        required={required}
        {...props}
      />

      {(error || helper) && (
        <p className={`mt-1.5 text-xs ${error ? 'text-red-400' : 'text-slate-500'}`}>
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
  required  = false,
  fullWidth = true,
  className = '',
  selectClassName = '',
  ...props
}, ref) => {
  const base = `
    w-full px-4 py-2.5 bg-slate-800 border rounded-xl
    text-white
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:bg-slate-900 disabled:text-slate-600 disabled:cursor-not-allowed
    appearance-none
  `
  const state = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500 hover:border-slate-600'

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-slate-400 mb-1.5">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          className={`${base} ${state} ${selectClassName}`}
          style={{ colorScheme: 'dark' }}
          required={required}
          {...props}
        >
          <option value="" disabled style={{ background: '#1e293b' }}>
            {placeholder}
          </option>
          {options.map(option => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              style={{ background: '#1e293b', color: '#f1f5f9' }}
            >
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </div>

      {(error || helper) && (
        <p className={`mt-1.5 text-xs ${error ? 'text-red-400' : 'text-slate-500'}`}>
          {error || helper}
        </p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Input
