import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { companyInitial } from '@/lib/format'
import { useAuth } from '@/context/AuthContext'
import type { Job } from '@/types'

type Props = { job: Job; onChange?: (job: Job) => void }

export function JobCard({ job, onChange }: Props) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const companyName = job.company?.name || 'Company'
  const external = Boolean(job.external_apply && job.job_url)

  async function toggleSave() {
    if (!user) return navigate('/sign-in', { state: { from: `/jobs/${job.id}` } })
    setBusy(true)
    try {
      const res = job.saved ? await api.unsaveJob(job.id) : await api.saveJob(job.id)
      onChange?.({ ...job, saved: res.saved })
    } finally {
      setBusy(false)
    }
  }

  async function onApply() {
    if (external && job.job_url) {
      window.open(job.job_url, '_blank', 'noopener,noreferrer')
      return
    }
    if (!user) return navigate('/sign-in', { state: { from: `/jobs/${job.id}` } })
    setBusy(true)
    try {
      const res = await api.applyToJob(job.id)
      onChange?.({ ...job, applied: true })
      if (res.redirect) navigate(res.redirect)
    } catch (e: unknown) {
      const err = e as { payload?: { redirect?: string }; message?: string }
      if (err.payload?.redirect) navigate(err.payload.redirect)
      else alert(err.message || 'Could not apply')
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="card-surface group flex h-full flex-col p-4 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-brand-border bg-brand-soft text-sm font-bold text-brand">
          {job.company?.logo_url ? (
            <img src={job.company.logo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            companyInitial(companyName)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 min-h-[2.7em] text-[0.975rem] font-semibold leading-snug text-ink">
            <Link to={`/jobs/${job.id}`} className="cursor-pointer transition duration-200 hover:text-brand">{job.title}</Link>
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="pill"><span className="truncate">{job.job_type}</span></span>
            <span className="pill max-w-[11.5rem]" title={job.location || undefined}><span className="truncate">{job.location_short}</span></span>
            <span className="pill pill-muted"><time dateTime={job.created_at}>{job.posted_on}</time></span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-1 flex-wrap items-end gap-x-4 gap-y-2 text-sm text-ink-muted">
        {job.experience_label && <span>{job.experience_label}</span>}
        {job.salary_label && <span>{job.salary_label}</span>}
        <span className="truncate text-ink-soft">{companyName}</span>
      </div>
      <div className="mt-4 flex gap-2">
        <button type="button" disabled={busy || Boolean(job.applied)} onClick={() => void onApply()} className="btn-primary flex-1">
          {job.applied ? 'Applied' : external ? 'Apply' : 'Apply now'}
        </button>
        <button type="button" disabled={busy} onClick={() => void toggleSave()} className={`btn-ghost ${job.saved ? '!border-brand-border !bg-brand-soft !text-brand' : ''}`} aria-label={job.saved ? 'Unsave job' : 'Save job'}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill={job.saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M6 4h12a1 1 0 0 1 1 1v16l-7-4-7 4V5a1 1 0 0 1 1-1Z" /></svg>
        </button>
      </div>
    </article>
  )
}
