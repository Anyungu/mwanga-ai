import { ChatTry } from '#/components/keys/chat-try'
import { DocumentUpload } from '#/components/keys/document-upload'
import { KeyForm } from '#/components/keys/key-form'
import { KeyTable } from '#/components/keys/key-table'
import { useCreateKey, useRevokeKey } from '#/hooks/mutations/keys'
import { useKeyUsageQuery, useKeysQuery } from '#/hooks/queries/keys'
import type { KeyCreate } from '#/lib/schemas/keys'

export function HomePage() {
  const keys = useKeysQuery()
  const usage = useKeyUsageQuery()
  const create = useCreateKey()
  const revoke = useRevokeKey()

  async function createKey(body: KeyCreate) {
    await create.mutateAsync(body)
  }

  return (
    <>
      <header>
        <h1 className="text-2xl font-medium">Mwanga</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Issue a key, upload knowledge, then try chat. The raw key is shown once.
        </p>
      </header>
      <KeyForm onSubmit={createKey} />
      <KeyTable
        keys={keys.data ?? []}
        usage={usage.data ?? []}
        pending={keys.isPending}
        error={keys.isError ? keys.error.message : null}
        revokingId={revoke.isPending ? revoke.variables : null}
        onRevoke={(id) => revoke.mutate(id)}
      />
      <DocumentUpload />
      <ChatTry issued={create.data} />
    </>
  )
}
