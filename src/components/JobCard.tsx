import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { companyAvatarTone, companyInitial } from '@/lib/format'
import { useAuth } from '@/context/AuthContext'
import type { Job } from '@/types'

type Props = { job: Job; onChange?: (job: Job) => void }

export function JobCard({ job, onChange }: Props) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const companyName = job.company?.name || 'Company'
  const external = Boolean(job.external_apply && job.job_url)
  const tone = companyAvatarTone(companyName)

  async function toggleSave(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return navigate('/sign-in', { state: { from: `/jobs/${job.id}` } })
    setBusy(true)
    try {
      const res = job.saved ? await api.unsaveJob(job.id) : await api.saveJob(job.id)
      onChange?.({ ...job, saved: res.saved })
    } finally {
      setBusy(false)
    }
  }

  async function onApply(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
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
    } catch (err: unknown) {
      const e2 = err as { payload?: { redirect?: string }; message?: string }
      if (e2.payload?.redirect) navigate(e2.payload.redirect)
      else alert(e2.message || 'Could not apply')
    } finally {
      setBusy(false)
    }
  }

  const meta = [job.job_type, job.location_short, job.experience_label].filter(Boolean)

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white transition duration-200 ease-out hover:border-slate-300 hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
      {/* top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-brand/80 via-brand/40 to-transparent opacity-0 transition duration-200 group-hover:opacity-100" />

      <div className="flex flex-1 flex-col p-5">
        {/* Company row */}
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}
          >
            {job.company?.logo_url ? (
              <img src={job.company.logo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-base font-bold tracking-tight">{companyInitial(companyName)}</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{companyName}</p>
            <p className="mt-0.5 text-xs text-ink-soft">
              <time dateTime={job.created_at}>Posted {job.posted_on}</time>
            </p>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={(e) => void toggleSave(e)}
            className={`inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border transition duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              job.saved
                ? 'border-brand-border bg-brand-soft text-brand'
                : 'border-slate-200 bg-white text-ink-soft hover:border-slate-300 hover:text-ink'
            }`}
            aria-label={job.saved ? 'Unsave job' : 'Save job'}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill={job.saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M6 4h12a1 1 0 0 1 1 1v16l-7-4-7 4V5a1 1 0 0 1 1-1Z" />
            </svg>
          </button>
        </div>

        {/* Title */}
        <h3 className="mt-4 line-clamp-2 min-h-[3.25rem] text-lg font-bold leading-snug tracking-tight text-ink">
          <Link
            to={`/jobs/${job.id}`}
            className="cursor-pointer after:absolute after:inset-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <span className="relative z-10 transition duration-200 group-hover:text-brand">{job.title}</span>
          </Link>
        </h3>

        {/* Meta — quiet separators, not heavy pills */}
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-muted">
          {meta.map((item, i) => (
            <span key={`${item}-${i}`} className="inline-flex items-center gap-2">
              {i > 0 && <span className="text-slate-300" aria-hidden="true">·</span>}
              <span className="max-w-[12rem] truncate" title={item === job.location_short ? job.location || undefined : undefined}>
                {item}
              </span>
            </span>
          ))}
        </div>

        {job.salary_label && (
          <p className="mt-2 text-sm font-semibold text-ink">{job.salary_label}</p>
        )}

        <div className="mt-auto pt-5">
          <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              disabled={busy || Boolean(job.applied)}
              onClick={(e) => void onApply(e)}
              className={`relative z-10 inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60 ${
                job.applied
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border border-slate-200 bg-white text-ink hover:border-brand hover:bg-brand-soft hover:text-brand'
              }`}
            >
              {job.applied ? (
                'Applied'
              ) : external ? (
                <>
                  Apply
                  <svg className="h-3.5 w-3.5 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 4h6v6M10 14 20 4M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" />
                  </svg>
                </>
              ) : (
                'Apply now'
              )}
            </button>
            <Link
              to={`/jobs/${job.id}`}
              className="relative z-10 inline-flex cursor-pointer items-center justify-center rounded-xl border border-transparent px-3 py-2.5 text-sm font-semibold text-brand transition duration-200 hover:bg-brand-soft"
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
