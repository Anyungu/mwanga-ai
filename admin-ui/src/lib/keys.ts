export function chatUrl() {
  if (import.meta.env.DEV) return 'http://localhost:8000/v1/chat'
  return '/api/v1/chat'
}
