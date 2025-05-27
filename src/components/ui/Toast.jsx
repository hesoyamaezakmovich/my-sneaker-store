import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'

const ToastContext = createContext()

const TOAST_ROOT_ID = 'toast-root'

function ensureToastRoot() {
  if (!document.getElementById(TOAST_ROOT_ID)) {
    const toastRoot = document.createElement('div')
    toastRoot.id = TOAST_ROOT_ID
    document.body.appendChild(toastRoot)
  }
}

const STATUS_STYLES = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-blue-600 text-white',
  warning: 'bg-yellow-500 text-black',
}

const ICONS = {
  success: (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
  ),
  error: (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
  ),
  info: (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01"/></svg>
  ),
  warning: (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z"/></svg>
  ),
}

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const removeToast = useCallback((id) => {
    setToasts((toasts) => toasts.filter((t) => t.id !== id))
    clearTimeout(timers.current[id])
    delete timers.current[id]
  }, [])

  const showToast = useCallback(({
    message,
    status = 'info',
    duration = 3000,
    action,
  }) => {
    const id = ++toastId
    setToasts((toasts) => [...toasts, { id, message, status, action }])
    timers.current[id] = setTimeout(() => removeToast(id), duration)
    return id
  }, [removeToast])

  const contextValue = {
    showToast,
    removeToast,
  }

  ensureToastRoot()

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-xs">
          {toasts.map(({ id, message, status, action }) => (
            <div
              key={id}
              className={`flex items-start shadow-lg rounded-lg px-4 py-3 animate-fadeIn ${STATUS_STYLES[status] || STATUS_STYLES.info}`}
              role="alert"
            >
              {ICONS[status]}
              <div className="flex-1 text-sm">{message}</div>
              {action && (
                <button
                  className="ml-3 underline text-xs"
                  onClick={() => {
                    action.onClick?.()
                    removeToast(id)
                  }}
                >
                  {action.label}
                </button>
              )}
              <button
                className="ml-2 p-1 rounded hover:bg-black/10"
                onClick={() => removeToast(id)}
                aria-label="Закрыть уведомление"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6"/></svg>
              </button>
            </div>
          ))}
        </div>,
        document.getElementById(TOAST_ROOT_ID)
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast должен использоваться внутри <ToastProvider>')
  return ctx
}

// Для SSR/Next.js можно добавить проверку typeof window !== 'undefined' для portal
