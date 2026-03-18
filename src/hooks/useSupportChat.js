import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supportService } from '../services/support.service'

export const useSupportChat = (enabled = true) => {
  return useQuery({
    queryKey: ['supportChat'],
    queryFn: () => supportService.getUserChat(),
    enabled,
  })
}

export const useChatMessages = (chatId) => {
  return useQuery({
    queryKey: ['supportMessages', chatId],
    queryFn: () => supportService.getChatMessages(chatId),
    enabled: !!chatId,
    refetchInterval: 5000,
  })
}

export const useSendMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ chatId, message }) =>
      supportService.sendMessage(chatId, message),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['supportMessages', data?.chat_id])
      queryClient.invalidateQueries(['supportChats'])
    },
  })
}

export const useAllChats = () => {
  return useQuery({
    queryKey: ['supportChats'],
    queryFn: () => supportService.getAllChats(),
    refetchInterval: 10000,
  })
}

export const useCloseChat = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (chatId) => supportService.closeChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries(['supportChats'])
    },
  })
}
