import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Логируем ошибку в консоль для отладки
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Здесь можно отправить ошибку в сервис логирования
    // например: logErrorToService(error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-md p-8 text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">
              Упс! Что-то пошло не так
            </h1>

            <p className="text-slate-400 mb-6">
              Произошла непредвиденная ошибка. Мы уже работаем над её устранением.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl hover:bg-indigo-500 transition-colors"
              >
                Обновить страницу
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-slate-800 text-slate-200 py-3 px-4 rounded-xl border border-slate-700 hover:bg-slate-700 transition-colors"
              >
                Вернуться на главную
              </button>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-300">
                  Детали ошибки (для разработчиков)
                </summary>
                <div className="mt-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 overflow-auto">
                  <p className="font-semibold">{this.state.error.toString()}</p>
                  <pre className="mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary