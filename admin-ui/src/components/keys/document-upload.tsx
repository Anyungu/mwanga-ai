import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { useIngestDocument } from '#/hooks/mutations/documents'

export function DocumentUpload() {
  const ingest = useIngestDocument()
  const [file, setFile] = useState<File | null>(null)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!file) {
      toast.error('Choose a TXT, MD, or PDF file', { id: 'choose-file' })
      return
    }
    await ingest.mutateAsync(file)
    setFile(null)
    ;(event.target as HTMLFormElement).reset()
  }

  return (
    <form onSubmit={submit} className="rounded-lg border bg-card p-4">
      <h2 className="text-sm font-medium">Upload knowledge</h2>
      <p className="mt-2 text-sm text-muted-foreground">TXT, Markdown, or PDF.</p>
      <div className="mt-4 flex items-center gap-3">
        <Input
          className="min-w-0 flex-1 cursor-pointer py-0 leading-9 file:mr-3 file:h-9 file:border-0 file:bg-transparent file:px-0 file:text-sm file:font-medium"
          type="file"
          accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        <Button type="submit" disabled={ingest.isPending || !file}>
          Upload
        </Button>
      </div>
    </form>
  )
}
