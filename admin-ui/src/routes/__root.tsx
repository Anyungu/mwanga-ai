import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { CircleAlert } from 'lucide-react'
import { useState } from 'react'
import { Toaster, toast } from 'sonner'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Mwanga',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            toast.error(error.message, { id: error.message })
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            toast.error(error.message, { id: error.message })
          },
        }),
      }),
  )
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster
            position="bottom-center"
            duration={4000}
            offset={24}
            icons={{ error: <CircleAlert className="size-4 text-destructive" /> }}
            toastOptions={{ classNames: { toast: 'justify-center text-center' } }}
            style={
              {
                '--border-radius': 'var(--radius)',
                '--normal-bg': 'var(--card)',
                '--normal-border': 'var(--border)',
                '--normal-text': 'var(--foreground)',
                '--error-bg': 'var(--card)',
                '--error-border': 'var(--border)',
                '--error-text': 'var(--foreground)',
              } as React.CSSProperties
            }
          />
        </QueryClientProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
