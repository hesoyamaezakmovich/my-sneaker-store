import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supportService } from '../services/support.service'
import { useEffect } from 'react'

export const useSupportChat = (userId) => {
  return useQuery({
    queryKey: ['supportChat', userId],
    queryFn: () => supportService.getUserChat(userId),
    enabled: !!userId
  })
}

export const useChatMessages = (chatId) => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['supportMessages', chatId],
    queryFn: () => supportService.getChatMessages(chatId),
    enabled: !!chatId,
    refetchInterval: 5000 // Обновляем каждые 5 секунд
  })

  useEffect(() => {
    if (!chatId) return

    const subscription = supportService.subscribeToMessages(chatId, (payload) => {
      queryClient.setQueryData(['supportMessages', chatId], (oldData) => {
        if (!oldData) return [payload.new]
        return [...oldData, payload.new]
      })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [chatId, queryClient])

  return query
}

export const useSendMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ chatId, message, isAdmin, userId }) =>
      supportService.sendMessage(chatId, message, isAdmin, userId),
    onSuccess: (data) => {
      // Обновляем список сообщений
      queryClient.setQueryData(['supportMessages', data.chat_id], (oldData) => {
        if (!oldData) return [data]
        return [...oldData, data]
      })
      // Обновляем список чатов для админа
      queryClient.invalidateQueries(['supportChats'])
    }
  })
}

export const useAllChats = () => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['supportChats'],
    queryFn: () => supportService.getAllChats(),
    refetchInterval: 10000 // Обновляем каждые 10 секунд
  })

  useEffect(() => {
    const subscription = supportService.subscribeToChats(() => {
      queryClient.invalidateQueries(['supportChats'])
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [queryClient])

  return query
}

export const useCloseChat = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (chatId) => supportService.closeChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries(['supportChats'])
    }
  })
}