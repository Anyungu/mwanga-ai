import { Input } from '#/components/ui/input'

interface NumberInputProps {
  label: string
  value: number
  error?: string
  min?: number
  step?: string
  required?: boolean
  onChange: (value: number) => void
}

export function NumberInput({ label, value, error, min, step, required, onChange }: NumberInputProps) {
  return (
    <label className="block text-sm font-medium text-foreground">
      {label}
      <Input
        className="mt-1"
        type="number"
        value={Number.isFinite(value) ? value : ''}
        min={min}
        step={step}
        required={required}
        onChange={(event) => {
          const raw = event.target.value
          onChange(raw === '' ? Number.NaN : Number(raw))
        }}
      />
      {error && <span className="mt-1 block text-sm font-normal text-destructive">{error}</span>}
    </label>
  )
}
