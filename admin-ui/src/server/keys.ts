import { createServerFn } from '@tanstack/react-start'

import { gateway } from '#/lib/api'
import { type KeyRecord, keyCreateSchema, revokeKeySchema } from '#/lib/schemas/keys'

export const listKeys = createServerFn({ method: 'GET' }).handler(() =>
  gateway<KeyRecord[]>('/v1/admin/keys'),
)

export const createKey = createServerFn({ method: 'POST' })
  .validator(keyCreateSchema)
  .handler(({ data }) =>
    gateway<KeyRecord & { key: string }>('/v1/admin/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  )

export const revokeKey = createServerFn({ method: 'POST' })
  .validator(revokeKeySchema)
  .handler(({ data }) =>
    gateway<KeyRecord>(`/v1/admin/keys/${data.id}/revoke`, { method: 'PUT' }),
  )
