import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { JobCard } from '@/components/JobCard'
import { fetchCompany } from '@/lib/api'
import type { Company, Job } from '@/types'

export function CompanyShowPage() {
  const { id } = useParams()
  const [company, setCompany] = useState<Company | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)

    fetchCompany(id)
      .then((res) => {
        if (cancelled) return
        setCompany(res.data)
        setJobs(res.jobs)
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

  if (error || !company) {
    return (
      <div className="container-page py-16">
        <p className="text-ink-muted">{error || 'Company not found'}</p>
        <Link to="/companies" className="mt-4 inline-block text-brand">Back to companies</Link>
      </div>
    )
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <Link to="/companies" className="text-sm font-medium text-ink-muted hover:text-brand">← All companies</Link>
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-card sm:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">{company.name}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          {company.company_type && <span className="pill">{company.company_type}</span>}
          {company.location_short && <span className="pill">{company.location_short}</span>}
        </div>
        {company.website && (
          <a href={company.website} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-medium text-brand hover:underline">
            {company.website}
          </a>
        )}
      </div>

      <h2 className="mt-10 text-lg font-semibold text-ink">Open roles</h2>
      {jobs.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">No active jobs right now.</p>
      ) : (
        <ul className="mt-4 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <li key={job.id}><JobCard job={job} /></li>
          ))}
        </ul>
      )}
    </div>
  )
}
