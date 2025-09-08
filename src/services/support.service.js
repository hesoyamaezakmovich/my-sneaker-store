import { supabase } from './supabase'

export const supportService = {
  // Создать новый чат поддержки
  async createSupportChat(userId) {
    const { data, error } = await supabase
      .from('support_chats')
      .insert([
        {
          user_id: userId,
          status: 'open',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  // Получить чат пользователя (создать если нет)
  async getUserChat(userId) {
    // Сначала попробуем найти открытый чат
    let { data: existingChat, error } = await supabase
      .from('support_chats')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'open')
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    // Если нет открытого чата, создаем новый
    if (!existingChat) {
      existingChat = await this.createSupportChat(userId)
    }

    return existingChat
  },

  // Получить все чаты для админа
  async getAllChats() {
    const { data, error } = await supabase
      .from('support_chats')
      .select(`
        *,
        user:profiles(id, name, email),
        messages:support_messages(
          id,
          message,
          created_at,
          is_admin
        )
      `)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Получить сообщения чата
  async getChatMessages(chatId) {
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  },

  // Отправить сообщение
  async sendMessage(chatId, message, isAdmin = false, userId = null) {
    const { data, error } = await supabase
      .from('support_messages')
      .insert([
        {
          chat_id: chatId,
          message: message.trim(),
          is_admin: isAdmin,
          user_id: userId,
          created_at: new Date().toISOString()
        }
      ])
      .select('*')
      .single()

    if (error) throw error

    // Обновляем время последнего обновления чата
    await supabase
      .from('support_chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId)

    return data
  },

  // Закрыть чат
  async closeChat(chatId) {
    const { data, error } = await supabase
      .from('support_chats')
      .update({ 
        status: 'closed',
        updated_at: new Date().toISOString()
      })
      .eq('id', chatId)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  // Подписка на новые сообщения
  subscribeToMessages(chatId, callback) {
    return supabase
      .channel(`support_messages_${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `chat_id=eq.${chatId}`
        },
        callback
      )
      .subscribe()
  },

  // Подписка на изменения чатов (для админа)
  subscribeToChats(callback) {
    return supabase
      .channel('support_chats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_chats'
        },
        callback
      )
      .subscribe()
  }
}