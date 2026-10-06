import type { ReactNode } from 'react'

import { cn } from '#/lib/utils'

interface ButtonProps {
  type?: 'button' | 'submit'
  variant?: 'primary' | 'destructive'
  disabled?: boolean
  children: ReactNode
  onClick?: () => void
}

const variants = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  destructive: 'text-destructive hover:bg-muted',
}

export function Button({ type = 'button', variant = 'primary', disabled, children, onClick }: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
      )}
    >
      {children}
    </button>
  )
}
