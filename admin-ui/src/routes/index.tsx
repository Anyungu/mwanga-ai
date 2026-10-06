import { createFileRoute } from '@tanstack/react-router'

import { KeysPage } from '#/pages/keys'

export const Route = createFileRoute('/')({
  ssr: false,
  component: KeysPage,
})
