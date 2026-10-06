import { ChatTry } from '#/components/keys/chat-try'
import { KeyForm } from '#/components/keys/key-form'
import { KeyTable } from '#/components/keys/key-table'
import { useCreateKey, useRevokeKey } from '#/hooks/mutations/keys'
import { useKeysQuery } from '#/hooks/queries/keys'
import type { KeyCreate } from '#/lib/schemas/keys'

export function KeysPage() {
  const keys = useKeysQuery()
  const create = useCreateKey()
  const revoke = useRevokeKey()

  async function createKey(body: KeyCreate) {
    await create.mutateAsync(body)
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
        <header>
          <h1 className="text-2xl font-medium">API keys</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a key and call chat with it. The raw key is shown once.
          </p>
        </header>
        <KeyForm onSubmit={createKey} />
        <KeyTable
          keys={keys.data ?? []}
          pending={keys.isPending}
          error={keys.isError ? keys.error.message : null}
          revokingId={revoke.isPending ? revoke.variables : null}
          onRevoke={(id) => revoke.mutate(id)}
        />
        <ChatTry issued={create.data} />
      </div>
    </main>
  )
}
