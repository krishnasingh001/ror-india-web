import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { JobCard } from '@/components/JobCard'
import { CompanyCard } from '@/components/CompanyCard'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { DashboardData } from '@/types'

export function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.dashboard()
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="container-page py-16"><div className="h-64 animate-pulse rounded-2xl bg-white" /></div>
  if (error || !data) return <div className="container-page py-16 text-ink-muted">{error || 'Unable to load dashboard'}</div>

  const stats = data.stats || {}

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">Hi, {user?.name?.split(' ')[0] || 'there'}</h1>
          <p className="mt-2 text-ink-muted">Track applications, saved roles, and companies you follow.</p>
        </div>
        <Link to="/" className="btn-primary">Browse jobs</Link>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="card-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{key.replace(/_/g, ' ')}</p>
            <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
          </div>
        ))}
      </div>

      {data.role === 'recruiter' ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-ink">Your recent postings</h2>
          <ul className="mt-4 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {(data.recent_jobs || []).map((job) => <li key={job.id}><JobCard job={job} /></li>)}
          </ul>
        </section>
      ) : (
        <>
          <section className="mt-10">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-ink">Recent applications</h2>
              <Link to="/applications" className="text-sm font-semibold text-brand hover:underline">View all</Link>
            </div>
            <ul className="mt-4 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {(data.recent_applications || []).map((a) => <li key={a.id}><JobCard job={{ ...a.job, applied: true }} /></li>)}
            </ul>
            {!data.recent_applications?.length && <p className="mt-4 text-sm text-ink-muted">No applications yet.</p>}
          </section>
          <section className="mt-10">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-ink">Saved jobs</h2>
              <Link to="/saved-jobs" className="text-sm font-semibold text-brand hover:underline">View all</Link>
            </div>
            <ul className="mt-4 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {(data.recent_saved_jobs || []).map((s) => <li key={s.id}><JobCard job={{ ...s.job, saved: true }} /></li>)}
            </ul>
          </section>
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-ink">Companies you follow</h2>
            <ul className="mt-4 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
              {(data.followed_companies || []).map((c) => <li key={c.id}><CompanyCard company={{ ...c, followed: true }} /></li>)}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}
