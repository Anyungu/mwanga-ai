import { Button } from '#/components/ui/button'
import type { KeyRecord, KeyUsage } from '#/lib/schemas/keys'

interface KeyTableProps {
  keys: KeyRecord[]
  usage: KeyUsage[]
  pending?: boolean
  error?: string | null
  revokingId?: number | null
  onRevoke: (id: number) => void
}

const emptyUsage: KeyUsage = {
  api_key_id: 0,
  request_count: 0,
  tokens_input: 0,
  tokens_output: 0,
  cost_usd: 0,
}

export function KeyTable({ keys, usage, pending, error, revokingId, onRevoke }: KeyTableProps) {
  const usageById = new Map(usage.map((item) => [item.api_key_id, item]))

  return (
    <section className="overflow-hidden rounded-lg border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Team</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Per minute</th>
            <th className="px-4 py-3 font-medium">Daily USD</th>
            <th className="px-4 py-3 font-medium">Requests</th>
            <th className="px-4 py-3 font-medium">Tokens</th>
            <th className="px-4 py-3 font-medium">Spend today</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {pending && (
            <tr>
              <td className="px-4 py-3 text-muted-foreground" colSpan={9}>
                Loading keys…
              </td>
            </tr>
          )}
          {!pending && error && (
            <tr>
              <td className="px-4 py-3 text-destructive" colSpan={9}>
                {error}
              </td>
            </tr>
          )}
          {!pending && !error && keys.length === 0 && (
            <tr>
              <td className="px-4 py-3 text-muted-foreground" colSpan={9}>
                No keys yet.
              </td>
            </tr>
          )}
          {!pending &&
            !error &&
            keys.map((item) => {
              const today = usageById.get(item.id) ?? emptyUsage
              return (
                <tr key={item.id}>
                  <td className="px-4 py-3">{item.owner_team}</td>
                  <td className="px-4 py-3">{item.role}</td>
                  <td className="px-4 py-3">{item.rate_limit_rpm}</td>
                  <td className="px-4 py-3">{item.daily_cost_limit_usd}</td>
                  <td className="px-4 py-3">{today.request_count}</td>
                  <td className="px-4 py-3">{today.tokens_input + today.tokens_output}</td>
                  <td className="px-4 py-3">{today.cost_usd.toFixed(4)}</td>
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
              )
            })}
        </tbody>
      </table>
    </section>
  )
}
