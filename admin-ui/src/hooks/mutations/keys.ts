import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { KeyCreate } from '#/lib/schemas/keys'
import { createKey, revokeKey } from '#/server/keys'

export function useCreateKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: KeyCreate) => createKey({ data: body }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['keys'] })
    },
  })
}

export function useRevokeKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => revokeKey({ data: { id } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['keys'] })
    },
  })
}