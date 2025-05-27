import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const MODAL_ROOT_ID = 'modal-root'

function ensureModalRoot() {
  if (!document.getElementById(MODAL_ROOT_ID)) {
    const modalRoot = document.createElement('div')
    modalRoot.id = MODAL_ROOT_ID
    document.body.appendChild(modalRoot)
  }
}

const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  size = 'md', // 'sm', 'md', 'lg', 'xl', 'full'
  showClose = true,
  className = '',
  overlayClassName = '',
  disableOverlayClose = false,
  disableEscClose = false,
}) => {
  const modalRef = useRef(null)

  useEffect(() => {
    ensureModalRoot()
    if (!open) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !disableEscClose) {
        onClose?.()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, disableEscClose, onClose])

  useEffect(() => {
    if (!open) return
    // Фокус на модалку
    modalRef.current?.focus()
  }, [open])

  if (!open) return null

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'w-full h-full',
  }

  const modalContent = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${overlayClassName}`}
      style={{ background: 'rgba(0,0,0,0.35)' }}
      onClick={disableOverlayClose ? undefined : onClose}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative bg-white rounded-xl shadow-xl w-full ${sizeStyles[size] || sizeStyles.md} mx-4 p-6 animate-fadeIn ${className}`}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {showClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded hover:bg-gray-100 focus:outline-none"
            aria-label="Закрыть модальное окно"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6"/></svg>
          </button>
        )}
        {title && <h2 className="text-lg font-semibold mb-2">{title}</h2>}
        {description && <p className="text-gray-500 mb-4">{description}</p>}
        <div>{children}</div>
        {actions && <div className="mt-6 flex gap-2 justify-end">{actions}</div>}
      </div>
    </div>
  )

  return createPortal(modalContent, document.getElementById(MODAL_ROOT_ID))
}

export default Modal
