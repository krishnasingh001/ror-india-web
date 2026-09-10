import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { Job } from '@/types'

export function JobShowPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!id) return
    api.fetchJob(id)
      .then((res) => setJob(res.data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  async function onSave() {
    if (!job) return
    if (!user) return navigate('/sign-in', { state: { from: `/jobs/${job.id}` } })
    setBusy(true)
    try {
      const res = job.saved ? await api.unsaveJob(job.id) : await api.saveJob(job.id)
      setJob({ ...job, saved: res.saved })
    } finally {
      setBusy(false)
    }
  }

  async function onApply() {
    if (!job) return
    if (job.external_apply && job.job_url) {
      window.open(job.job_url, '_blank', 'noopener,noreferrer')
      return
    }
    if (!user) return navigate('/sign-in', { state: { from: `/jobs/${job.id}` } })
    setBusy(true)
    try {
      await api.applyToJob(job.id)
      setJob({ ...job, applied: true })
    } catch (e: unknown) {
      const err = e as { payload?: { redirect?: string }; message?: string }
      if (err.payload?.redirect) navigate(err.payload.redirect)
      else alert(err.message || 'Could not apply')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="container-page py-16"><div className="h-64 animate-pulse rounded-2xl bg-white" /></div>
  if (error || !job) return (
    <div className="container-page py-16">
      <p className="text-ink-muted">{error || 'Job not found'}</p>
      <Link to="/" className="mt-4 inline-block text-brand">Back to jobs</Link>
    </div>
  )

  return (
    <div className="container-page py-10 sm:py-14">
      <Link to="/" className="text-sm font-semibold text-ink-muted hover:text-brand">← All jobs</Link>
      <div className="mt-6 max-w-3xl card-surface p-6 shadow-panel sm:p-8">
        <p className="text-sm font-semibold text-brand">{job.company?.name}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">{job.title}</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="pill">{job.job_type}</span>
          <span className="pill">{job.location_short}</span>
          {job.experience_label && <span className="pill">{job.experience_label}</span>}
          {job.salary_label && <span className="pill">{job.salary_label}</span>}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" disabled={busy || Boolean(job.applied)} onClick={() => void onApply()} className="btn-primary">
            {job.applied ? 'Applied' : job.external_apply ? 'Apply on company site' : 'Apply now'}
          </button>
          <button type="button" disabled={busy} onClick={() => void onSave()} className="btn-secondary">
            {job.saved ? 'Saved' : 'Save job'}
          </button>
        </div>
      </div>
    </div>
  )
}
