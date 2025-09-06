import React, { createContext, useContext, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, XCircle, X } from 'lucide-react'

const ToastContext = createContext()

export const useCustomToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useCustomToast must be used within ToastProvider')
  }
  return context
}

let toastId = 0

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = ++toastId
    const toast = { id, message, type }
    
    setToasts(prev => [...prev, toast])
    
    setTimeout(() => {
      removeToast(id)
    }, duration)
    
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const success = useCallback((message) => addToast(message, 'success'), [addToast])
  const error = useCallback((message) => addToast(message, 'error'), [addToast])

  const value = {
    success,
    error,
    removeToast
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 z-50 space-y-3">
          {toasts.map(toast => (
            <Toast key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

const Toast = ({ toast, onRemove }) => {
  const { id, message, type } = toast

  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600'
  const Icon = type === 'success' ? CheckCircle : XCircle

  return (
    <div
      className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg cursor-pointer 
                  transform transition-all duration-300 animate-slide-in-right
                  hover:scale-105 max-w-sm w-full relative`}
      onClick={() => onRemove(id)}
    >
      <div className="flex items-center">
        <Icon className="w-5 h-5 mr-3" />
        <span className="flex-1 text-sm font-medium pr-6">{message}</span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove(id)
          }}
          className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// CSS анимации (добавь в index.css)
const styles = `
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
`

// Автоматически добавляем стили
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.textContent = styles
  document.head.appendChild(styleElement)
}