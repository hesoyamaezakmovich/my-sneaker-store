import React, { useState } from 'react'
import { useAllChats, useChatMessages, useSendMessage, useCloseChat } from '../hooks/useSupportChat'
import { useUserQuery } from '../hooks/useUserQuery'
import { MessageCircle, Send, X, User, Clock, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const AdminSupportPage = () => {
  const [selectedChatId, setSelectedChatId] = useState(null)
  const [message, setMessage] = useState('')
  
  const { data: user } = useUserQuery()
  const { data: chats = [], isLoading: chatsLoading } = useAllChats()
  const { data: messages = [], isLoading: messagesLoading } = useChatMessages(selectedChatId)
  const sendMessageMutation = useSendMessage()
  const closeChatMutation = useCloseChat()

  const selectedChat = chats.find(chat => chat.id === selectedChatId)

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!message.trim() || !selectedChatId) return

    try {
      await sendMessageMutation.mutateAsync({
        chatId: selectedChatId,
        message: message.trim(),
        isAdmin: true,
        userId: user.id
      })
      setMessage('')
    } catch (error) {
      toast.error('Ошибка отправки сообщения')
    }
  }

  const handleCloseChat = async (chatId) => {
    try {
      await closeChatMutation.mutateAsync(chatId)
      toast.success('Чат закрыт')
      if (selectedChatId === chatId) {
        setSelectedChatId(null)
      }
    } catch (error) {
      toast.error('Ошибка закрытия чата')
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getLastMessage = (chat) => {
    if (!chat.messages || chat.messages.length === 0) {
      return 'Нет сообщений'
    }
    const lastMessage = chat.messages[chat.messages.length - 1]
    return lastMessage.message.length > 50 
      ? lastMessage.message.substring(0, 50) + '...'
      : lastMessage.message
  }

  const getUnreadCount = (chat) => {
    if (!chat.messages) return 0
    return chat.messages.filter(msg => !msg.is_admin).length
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <MessageCircle className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Чаты поддержки</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="flex h-[600px]">
          {/* Список чатов */}
          <div className="w-80 border-r bg-gray-50">
            <div className="p-4 border-b bg-white">
              <h2 className="font-semibold text-gray-900">Активные чаты</h2>
              <p className="text-sm text-gray-600">{chats.filter(c => c.status === 'open').length} открытых</p>
            </div>
            
            <div className="overflow-y-auto h-full">
              {chatsLoading ? (
                <div className="p-4 text-center text-gray-600">Загрузка...</div>
              ) : chats.length === 0 ? (
                <div className="p-4 text-center text-gray-600">Нет чатов</div>
              ) : (
                <div className="space-y-1 p-2">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChatId(chat.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedChatId === chat.id
                          ? 'bg-blue-100 border-blue-200'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="font-medium text-sm text-gray-900">
                              {chat.user?.name || 'Пользователь'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {chat.user?.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {chat.status === 'closed' && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          {getUnreadCount(chat) > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {getUnreadCount(chat)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                        {getLastMessage(chat)}
                      </p>
                      
                      <div className="flex items-center gap-1 mt-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatTime(chat.updated_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Область чата */}
          <div className="flex-1 flex flex-col">
            {!selectedChat ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Выберите чат для начала общения</p>
                </div>
              </div>
            ) : (
              <>
                {/* Заголовок чата */}
                <div className="p-4 border-b bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="w-6 h-6 text-gray-500" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedChat.user?.name || 'Пользователь'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedChat.user?.email}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedChat.status === 'open' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedChat.status === 'open' ? 'Открыт' : 'Закрыт'}
                    </span>
                  </div>
                  
                  {selectedChat.status === 'open' && (
                    <button
                      onClick={() => handleCloseChat(selectedChat.id)}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 text-sm flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Закрыть чат
                    </button>
                  )}
                </div>

                {/* Сообщения */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messagesLoading ? (
                    <div className="text-center text-gray-600">Загрузка сообщений...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-600">Нет сообщений</div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-md px-4 py-2 rounded-lg ${
                            msg.is_admin
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          <p className="break-words">{msg.message}</p>
                          <p className={`text-xs mt-1 ${
                            msg.is_admin ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Поле ввода */}
                {selectedChat.status === 'open' && (
                  <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Введите ответ..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={sendMessageMutation.isLoading}
                      />
                      <button
                        type="submit"
                        disabled={!message.trim() || sendMessageMutation.isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Отправить
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSupportPage