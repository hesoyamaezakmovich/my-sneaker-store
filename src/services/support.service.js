import api, { handleApiError } from './api'

export const supportService = {
  async getUserChat() {
    try {
      const { data } = await api.post('/support/chat')
      return data.chat
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  async getChatMessages(chatId) {
    try {
      const { data } = await api.get(`/support/chat/${chatId}/messages`)
      return data.messages
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  async sendMessage(chatId, message) {
    try {
      const { data } = await api.post(`/support/chat/${chatId}/messages`, { message })
      return data.message
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  async getAllChats() {
    try {
      const { data } = await api.get('/support/chats')
      return data.chats
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  async closeChat(chatId) {
    try {
      const { data } = await api.patch(`/support/chat/${chatId}`, { status: 'closed' })
      return data.chat
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Polling-based замена real-time подписки
  subscribeToMessages(chatId, callback, intervalMs = 5000) {
    const interval = setInterval(async () => {
      try {
        const messages = await this.getChatMessages(chatId)
        callback(messages)
      } catch {}
    }, intervalMs)
    return { unsubscribe: () => clearInterval(interval) }
  },

  subscribeToChats(callback, intervalMs = 10000) {
    const interval = setInterval(async () => {
      try {
        const chats = await this.getAllChats()
        callback(chats)
      } catch {}
    }, intervalMs)
    return { unsubscribe: () => clearInterval(interval) }
  },
}

