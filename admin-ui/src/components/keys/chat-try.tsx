import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import { TextInput } from '#/components/ui/text-input'
import { apiClient } from '#/lib/api'
import { chatUrl } from '#/lib/keys'
import type { KeyRecord } from '#/lib/schemas/keys'

interface ChatTryProps {
  issued?: KeyRecord & { key: string }
}

export function ChatTry({ issued }: ChatTryProps) {
  const [message, setMessage] = useState('')
  const [reply, setReply] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!issued) {
      toast.error('Create a key first', { id: 'Create a key first' })
      return
    }
    setReply('')
    setPending(true)
    const [error, body] = await apiClient<{ reply: string }>(chatUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': issued.key,
      },
      body: JSON.stringify({ message }),
    })
    setPending(false)
    if (error || !body) {
      const detail = error?.message ?? 'Request failed'
      toast.error(detail, { id: detail })
      return
    }
    setReply(body.reply)
  }

  return (
    <form onSubmit={submit} className="rounded-lg border bg-card p-4">
      <h2 className="text-sm font-medium">Try chat</h2>
      {issued ? (
        <p className="mt-3 rounded-md bg-muted px-3 py-2 font-mono text-sm break-all">
          {issued.owner_team}: {issued.key}
        </p>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">Create a key first. It is shown once.</p>
      )}
      <div className="mt-4">
        <TextInput label="Message" value={message} required onChange={setMessage} />
      </div>
      <div className="mt-4">
        <Button type="submit" disabled={pending || !issued}>
          Send
        </Button>
      </div>
      {reply && <p className="mt-4 text-sm">{reply}</p>}
    </form>
  )
}
