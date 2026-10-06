import { Input } from '#/components/ui/input'

interface TextInputProps {
  label: string
  value: string
  error?: string
  required?: boolean
  onChange: (value: string) => void
}

export function TextInput({ label, value, error, required, onChange }: TextInputProps) {
  return (
    <label className="block text-sm font-medium text-foreground">
      {label}
      <Input className="mt-1" value={value} required={required} onChange={(event) => onChange(event.target.value)} />
      {error && <span className="mt-1 block text-sm font-normal text-destructive">{error}</span>}
    </label>
  )
}
