import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const MODAL_ROOT_ID = 'modal-root'

function ensureModalRoot() {
  if (!document.getElementById(MODAL_ROOT_ID)) {
    const el = document.createElement('div')
    el.id = MODAL_ROOT_ID
    document.body.appendChild(el)
  }
}

const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  size               = 'md',
  showClose          = true,
  className          = '',
  overlayClassName   = '',
  disableOverlayClose = false,
  disableEscClose    = false,
}) => {
  const modalRef = useRef(null)

  useEffect(() => {
    ensureModalRoot()
    if (!open) return
    const handleKeyDown = e => { if (e.key === 'Escape' && !disableEscClose) onClose?.() }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, disableEscClose, onClose])

  useEffect(() => { if (open) modalRef.current?.focus() }, [open])

  if (!open) return null

  const sizeStyles = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl', full: 'w-full h-full' }

  const content = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 ${overlayClassName}`}
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={disableOverlayClose ? undefined : onClose}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full ${sizeStyles[size] || sizeStyles.md} p-6 ${className}`}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {showClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-all duration-200"
            aria-label="Закрыть"
            style={{ boxShadow: 'none' }}
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {title && <h2 className="text-lg font-semibold text-white mb-2 pr-8">{title}</h2>}
        {description && <p className="text-slate-400 text-sm mb-4">{description}</p>}
        <div>{children}</div>
        {actions && <div className="mt-6 flex gap-2 justify-end">{actions}</div>}
      </div>
    </div>
  )

  return createPortal(content, document.getElementById(MODAL_ROOT_ID))
}

export default Modal
