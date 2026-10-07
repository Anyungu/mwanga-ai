import { valibotResolver } from '@hookform/resolvers/valibot'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import { TextInput } from '#/components/ui/text-input'
import { useChat } from '#/hooks/mutations/chat'
import { type ChatMessage, type KeyRecord, chatMessageSchema } from '#/lib/schemas/keys'

interface ChatTryProps {
  issued?: KeyRecord & { key: string }
}

export function ChatTry({ issued }: ChatTryProps) {
  const chat = useChat()
  const form = useForm<ChatMessage>({
    resolver: valibotResolver(chatMessageSchema),
    defaultValues: { message: '' },
  })

  async function submit(values: ChatMessage) {
    if (!issued) {
      toast.error('Create a key first', { id: 'Create a key first' })
      return
    }
    await chat.mutateAsync({ message: values.message, key: issued.key })
  }

  return (
    <form onSubmit={form.handleSubmit(submit)} className="rounded-lg border bg-card p-4">
      <h2 className="text-sm font-medium">Try chat</h2>
      {issued ? (
        <p className="mt-3 rounded-md bg-muted px-3 py-2 font-mono text-sm break-all">
          {issued.owner_team}: {issued.key}
        </p>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">Create a key first. It is shown once.</p>
      )}
      <div className="mt-4">
        <Controller
          name="message"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput
              label="Message"
              value={field.value}
              error={fieldState.error?.message}
              onChange={field.onChange}
            />
          )}
        />
      </div>
      <div className="mt-4">
        <Button type="submit" disabled={form.formState.isSubmitting || !issued}>
          Send
        </Button>
      </div>
      {chat.data?.reply && <p className="mt-4 text-sm">{chat.data.reply}</p>}
    </form>
  )
}
