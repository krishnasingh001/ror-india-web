import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { JobCard } from '@/components/JobCard'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { Company, Job } from '@/types'

export function CompanyShowPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [company, setCompany] = useState<Company | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!id) return
    api.fetchCompany(id)
      .then((res) => { setCompany(res.data); setJobs(res.jobs) })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  async function toggleFollow() {
    if (!company) return
    if (!user) return navigate('/sign-in', { state: { from: `/companies/${company.id}` } })
    setBusy(true)
    try {
      const res = company.followed ? await api.unfollowCompany(company.id) : await api.followCompany(company.id)
      setCompany({ ...company, followed: res.followed })
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="container-page py-16"><div className="h-64 animate-pulse rounded-2xl bg-white" /></div>
  if (error || !company) return (
    <div className="container-page py-16">
      <p className="text-ink-muted">{error || 'Company not found'}</p>
      <Link to="/companies" className="mt-4 inline-block text-brand">Back to companies</Link>
    </div>
  )

  return (
    <div className="container-page py-10 sm:py-14">
      <Link to="/companies" className="text-sm font-semibold text-ink-muted hover:text-brand">← All companies</Link>
      <div className="mt-6 card-surface p-6 shadow-panel sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-ink">{company.name}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {company.company_type && <span className="pill">{company.company_type}</span>}
              {company.location_short && <span className="pill">{company.location_short}</span>}
            </div>
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-semibold text-brand hover:underline">{company.website}</a>
            )}
          </div>
          <button type="button" disabled={busy} onClick={() => void toggleFollow()} className="btn-secondary">
            {company.followed ? 'Following' : 'Follow'}
          </button>
        </div>
      </div>
      <h2 className="mt-10 text-lg font-semibold text-ink">Open roles</h2>
      {jobs.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">No active jobs right now.</p>
      ) : (
        <ul className="mt-4 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <li key={job.id}>
              <JobCard job={job} onChange={(next) => setJobs((prev) => prev.map((j) => (j.id === next.id ? next : j)))} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
