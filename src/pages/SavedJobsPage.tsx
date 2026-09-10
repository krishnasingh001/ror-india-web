import { useEffect, useState } from 'react'
import { JobCard } from '@/components/JobCard'
import { api } from '@/lib/api'
import type { Job } from '@/types'

export function SavedJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.savedJobs()
      .then((res) => setJobs(res.data.map((j) => ({ ...j, saved: true }))))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="text-3xl font-bold tracking-tight text-ink">Saved jobs</h1>
      <p className="mt-2 text-ink-muted">Roles you’ve bookmarked for later.</p>
      {error && <p className="mt-6 text-sm text-brand">{error}</p>}
      {loading ? <div className="mt-8 h-40 animate-pulse rounded-2xl bg-white" /> : (
        <ul className="mt-8 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <li key={job.id}>
              <JobCard job={job} onChange={(next) => setJobs((prev) => (next.saved ? prev.map((j) => (j.id === next.id ? next : j)) : prev.filter((j) => j.id !== next.id)))} />
            </li>
          ))}
        </ul>
      )}
      {!loading && !jobs.length && <p className="mt-8 text-sm text-ink-muted">No saved jobs yet.</p>}
    </div>
  )
}
