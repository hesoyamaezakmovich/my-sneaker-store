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
  
  const { data: chat } = useSupportChat(user?.id)
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
        isAdmin: false,
        userId: user.id
      })
      setMessage('')
    } catch (error) {
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
        className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-2xl border transition-all duration-200 ${
      isMinimized ? 'w-80 h-12' : 'w-80 h-96'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <span className="font-semibold">Поддержка</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-blue-700 rounded"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-blue-700 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 p-4 h-64 overflow-y-auto bg-gray-50">
            {!user ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Войдите в аккаунт для общения с поддержкой</p>
                <Button onClick={() => setIsAuthModalOpen(true)}>
                  Войти
                </Button>
              </div>
            ) : isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Загрузка...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Напишите ваше сообщение</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        msg.is_admin
                          ? 'bg-gray-200 text-gray-800'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      <p className="break-words">{msg.message}</p>
                      <p className={`text-xs mt-1 ${
                        msg.is_admin ? 'text-gray-500' : 'text-blue-100'
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
            <form onSubmit={handleSendMessage} className="p-4 border-t bg-white rounded-b-lg">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Введите сообщение..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  disabled={sendMessageMutation.isLoading}
                />
                <button
                  type="submit"
                  disabled={!message.trim() || sendMessageMutation.isLoading}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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