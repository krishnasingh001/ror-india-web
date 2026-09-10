import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchJob } from '@/lib/api'
import type { Job } from '@/types'

export function JobShowPage() {
  const { id } = useParams()
  const [job, setJob] = useState<Job | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)

    fetchJob(id)
      .then((res) => {
        if (!cancelled) setJob(res.data)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return <div className="container-page py-16"><div className="h-64 animate-pulse rounded-2xl bg-white" /></div>
  }

  if (error || !job) {
    return (
      <div className="container-page py-16">
        <p className="text-ink-muted">{error || 'Job not found'}</p>
        <Link to="/" className="mt-4 inline-block text-brand">Back to jobs</Link>
      </div>
    )
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <Link to="/" className="text-sm font-medium text-ink-muted hover:text-brand">← All jobs</Link>
      <div className="mt-6 max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-card sm:p-8">
        <p className="text-sm font-medium text-brand">{job.company?.name}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">{job.title}</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="pill">{job.job_type}</span>
          <span className="pill">{job.location_short}</span>
          {job.experience_label && <span className="pill">{job.experience_label}</span>}
          {job.salary_label && <span className="pill">{job.salary_label}</span>}
        </div>
        <div className="mt-8">
          {job.external_apply && job.job_url ? (
            <a href={job.job_url} target="_blank" rel="noopener noreferrer" className="btn-primary">
              Apply on company site
            </a>
          ) : (
            <p className="text-sm text-ink-muted">Sign in on the Rails app to apply internally (auth coming soon).</p>
          )}
        </div>
      </div>
    </div>
  )
}
