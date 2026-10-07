import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '#/lib/api'
import { chatUrl } from '#/lib/keys'

interface ChatInput {
  message: string
  key: string
}

export function useChat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ message, key }: ChatInput) => {
      const [error, body] = await apiClient<{ reply: string }>(chatUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': key,
        },
        body: JSON.stringify({ message }),
      })
      if (error || !body) throw error ?? new Error('Request failed')
      return body
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['keys', 'usage'] })
    }
  })
}
