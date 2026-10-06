import { valibotResolver } from '@hookform/resolvers/valibot'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '#/components/ui/button'
import { NumberInput } from '#/components/ui/number-input'
import { SelectField } from '#/components/ui/select'
import { TextInput } from '#/components/ui/text-input'
import { type KeyCreate, demoRoles, keyCreateSchema } from '#/lib/schemas/keys'

interface KeyFormProps {
  onSubmit: (body: KeyCreate) => Promise<void>
}

export function KeyForm({ onSubmit }: KeyFormProps) {
  const form = useForm<KeyCreate>({
    resolver: valibotResolver(keyCreateSchema),
    defaultValues: {
      owner_team: '',
      role: 'service_account',
      rate_limit_rpm: 60,
      daily_cost_limit_usd: 10,
    },
  })

  async function submit(values: KeyCreate) {
    await onSubmit(values)
  }

  return (
    <form onSubmit={form.handleSubmit(submit)} className="rounded-lg border bg-card p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          name="owner_team"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput
              label="Team"
              value={field.value}
              error={fieldState.error?.message}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          name="role"
          control={form.control}
          render={({ field, fieldState }) => (
            <SelectField
              label="Role"
              value={field.value}
              error={fieldState.error?.message}
              options={demoRoles.map((role) => ({
                value: role,
                label: role.replaceAll('_', ' '),
              }))}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          name="rate_limit_rpm"
          control={form.control}
          render={({ field, fieldState }) => (
            <NumberInput
              label="Requests per minute"
              value={field.value}
              min={1}
              error={fieldState.error?.message}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          name="daily_cost_limit_usd"
          control={form.control}
          render={({ field, fieldState }) => (
            <NumberInput
              label="Daily cost limit (USD)"
              value={field.value}
              min={0}
              step="0.01"
              error={fieldState.error?.message}
              onChange={field.onChange}
            />
          )}
        />
      </div>
      <div className="mt-4">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Create key
        </Button>
      </div>
    </form>
  )
}
