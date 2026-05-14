import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X, Minimize2 } from 'lucide-react'
import { useSupportChat, useChatMessages, useSendMessage } from '../../hooks/useSupportChat'
import { useUserQuery } from '../../hooks/useUserQuery'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import Button from '../ui/Button'

const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef(null)
  const { setIsAuthModalOpen } = useAuth()
  const { data: user } = useUserQuery()

  const { data: chat } = useSupportChat(!!user)
  const { data: messages = [], isLoading } = useChatMessages(chat?.id)
  const sendMessageMutation = useSendMessage()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!user) {
      setIsAuthModalOpen(true)
      return
    }

    if (!message.trim()) return

    try {
      await sendMessageMutation.mutateAsync({
        chatId: chat.id,
        message: message.trim(),
      })
      setMessage('')
    } catch {
      toast.error('Ошибка отправки сообщения')
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 transition-all duration-200 ${
      isMinimized ? 'w-80 h-12' : 'w-80 h-96'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 text-white rounded-t-2xl">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <span className="font-semibold text-sm">Поддержка</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-indigo-500 rounded-lg transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-indigo-500 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 p-4 h-64 overflow-y-auto bg-slate-950/50">
            {!user ? (
              <div className="text-center py-8">
                <p className="text-slate-400 mb-4 text-sm">Войдите в аккаунт для общения с поддержкой</p>
                <Button onClick={() => setIsAuthModalOpen(true)} variant="primary" size="small">
                  Войти
                </Button>
              </div>
            ) : isLoading ? (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm">Загрузка...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm">Напишите ваше сообщение</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-xl text-sm ${
                        msg.is_admin
                          ? 'bg-slate-800 text-slate-200 border border-slate-700'
                          : 'bg-indigo-600 text-white'
                      }`}
                    >
                      <p className="break-words">{msg.message}</p>
                      <p className={`text-xs mt-1 ${
                        msg.is_admin ? 'text-slate-500' : 'text-indigo-200'
                      }`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          {user && (
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900 rounded-b-2xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Введите сообщение..."
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  disabled={sendMessageMutation.isLoading}
                />
                <button
                  type="submit"
                  disabled={!message.trim() || sendMessageMutation.isLoading}
                  className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  )
}

export default SupportChat
