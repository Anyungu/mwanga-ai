import * as v from 'valibot'

export const demoRoles = ['service_account', 'viewer'] as const

export type DemoRole = (typeof demoRoles)[number]

export interface KeyRecord {
  id: number
  owner_team: string
  role: DemoRole | 'admin'
  rate_limit_rpm: number
  daily_cost_limit_usd: number
  is_active: boolean
  created_at: string
}

export interface KeyUsage {
  api_key_id: number
  request_count: number
  tokens_input: number
  tokens_output: number
  cost_usd: number
}

export const keyCreateSchema = v.object({
  owner_team: v.pipe(v.string(), v.minLength(1)),
  role: v.picklist(demoRoles),
  rate_limit_rpm: v.pipe(v.number(), v.minValue(1)),
  daily_cost_limit_usd: v.pipe(v.number(), v.minValue(0)),
})

export const revokeKeySchema = v.object({
  id: v.pipe(v.number(), v.integer(), v.minValue(1)),
})

export const chatMessageSchema = v.object({
  message: v.pipe(v.string(), v.minLength(1)),
})

export type KeyCreate = v.InferOutput<typeof keyCreateSchema>
export type RevokeKey = v.InferOutput<typeof revokeKeySchema>
export type ChatMessage = v.InferOutput<typeof chatMessageSchema>
