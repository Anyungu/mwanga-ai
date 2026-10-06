import { useQuery } from '@tanstack/react-query'

import { listKeys } from '#/server/keys'

export function useKeysQuery() {
  return useQuery({
    queryKey: ['keys'],
    queryFn: () => listKeys(),
  })
}
