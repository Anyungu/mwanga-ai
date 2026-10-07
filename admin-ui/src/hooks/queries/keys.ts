import { useQuery } from '@tanstack/react-query'

import { listKeyUsage, listKeys } from '#/server/keys'

export function useKeysQuery() {
  return useQuery({
    queryKey: ['keys'],
    queryFn: () => listKeys(),
  })
}

export function useKeyUsageQuery() {
  return useQuery({
    queryKey: ['keys', 'usage'],
    queryFn: () => listKeyUsage(),
  })
}
