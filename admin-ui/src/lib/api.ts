export type ApiResult<T> = [error: Error | null, data: T | null]

export async function apiClient<T>(url: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, init)
    if (!response.ok) {
      const body = await response.json().catch(() => null)
      const detail =
        body && typeof body === 'object' && 'detail' in body && typeof body.detail === 'string'
          ? body.detail
          : `Request failed (${response.status})`
      return [new Error(detail), null]
    }
    return [null, (await response.json()) as T]
  } catch {
    return [new Error('Gateway is not reachable'), null]
  }
}

export async function gateway<T>(path: string, init?: RequestInit): Promise<T> {
  const [error, data] = await apiClient<T>(
    `${process.env.GATEWAY_URL ?? 'http://localhost:8000'}${path}`,
    init,
  )
  if (error) throw error
  return data as T
}

export async function gatewayForm<T>(path: string, formData: FormData): Promise<T> {
  return gateway<T>(path, { method: 'POST', body: formData })
}
