import { useEffect, useState } from 'react'
import { JobCard } from '@/components/JobCard'
import { api } from '@/lib/api'
import type { Job } from '@/types'

export function ApplicationsPage() {
  const [items, setItems] = useState<Array<{ id: number; status?: string; job: Job }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.applications()
      .then((res) => setItems(res.data))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="text-3xl font-bold tracking-tight text-ink">Applications</h1>
      <p className="mt-2 text-ink-muted">Track roles you’ve applied to on ROR India.</p>
      {error && <p className="mt-6 text-sm text-brand">{error}</p>}
      {loading ? <div className="mt-8 h-40 animate-pulse rounded-2xl bg-white" /> : (
        <ul className="mt-8 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <li key={a.id}>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">{a.status || 'applied'}</div>
              <JobCard job={{ ...a.job, applied: true }} />
            </li>
          ))}
        </ul>
      )}
      {!loading && !items.length && <p className="mt-8 text-sm text-ink-muted">No applications yet.</p>}
    </div>
  )
}
