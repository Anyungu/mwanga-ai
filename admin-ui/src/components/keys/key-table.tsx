import { Button } from '#/components/ui/button'
import type { KeyRecord } from '#/lib/schemas/keys'

interface KeyTableProps {
  keys: KeyRecord[]
  pending?: boolean
  error?: string | null
  revokingId?: number | null
  onRevoke: (id: number) => void
}

export function KeyTable({ keys, pending, error, revokingId, onRevoke }: KeyTableProps) {
  return (
    <section className="overflow-hidden rounded-lg border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Team</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Per minute</th>
            <th className="px-4 py-3 font-medium">Daily USD</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {pending && (
            <tr>
              <td className="px-4 py-3 text-muted-foreground" colSpan={6}>
                Loading keys…
              </td>
            </tr>
          )}
          {!pending && error && (
            <tr>
              <td className="px-4 py-3 text-destructive" colSpan={6}>
                {error}
              </td>
            </tr>
          )}
          {!pending && !error && keys.length === 0 && (
            <tr>
              <td className="px-4 py-3 text-muted-foreground" colSpan={6}>
                No keys yet.
              </td>
            </tr>
          )}
          {!pending &&
            !error &&
            keys.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">{item.owner_team}</td>
                <td className="px-4 py-3">{item.role}</td>
                <td className="px-4 py-3">{item.rate_limit_rpm}</td>
                <td className="px-4 py-3">{item.daily_cost_limit_usd}</td>
                <td className="px-4 py-3">{item.is_active ? 'Active' : 'Revoked'}</td>
                <td className="px-4 py-3 text-right">
                  {item.is_active && (
                    <Button
                      variant="destructive"
                      disabled={revokingId === item.id}
                      onClick={() => onRevoke(item.id)}
                    >
                      Revoke
                    </Button>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </section>
  )
}
