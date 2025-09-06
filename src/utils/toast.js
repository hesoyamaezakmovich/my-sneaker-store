import toast from 'react-hot-toast'

// Обработчик для закрытия toast по клику
export const setupToastClickHandlers = () => {
  // Ждем когда DOM загрузится
  setTimeout(() => {
    document.addEventListener('click', (e) => {
      const toastElement = e.target.closest('[data-hot-toast] > div')
      if (toastElement) {
        toast.dismiss()
      }
    })
  }, 100)
}