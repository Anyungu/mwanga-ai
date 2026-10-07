import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ingestDocumentFile } from '#/server/keys'

export function useIngestDocument() {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return ingestDocumentFile({ data: formData })
    },
    onSuccess: (result) => {
      toast.success(`Ingested ${result.source} · ${result.chunks} chunks`, {
        id: `ingest-${result.source}`,
      })
    },
  })
}
