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

  const details: Array<{ label: string; value: string; title?: string }> = [
    { label: 'Type', value: job.job_type },
    {
      label: 'Location',
      value: job.location_short,
      title: job.location || undefined,
    },
  ]
  if (job.experience_label) {
    details.push({ label: 'Experience', value: job.experience_label })
  }
  if (job.salary_label) {
    details.push({ label: 'Salary', value: job.salary_label })
  }

  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-slate-200 bg-white transition duration-200 ease-out hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Company */}
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}
          >
            {job.company?.logo_url ? (
              <img src={job.company.logo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs font-bold">{companyInitial(companyName)}</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-ink-muted">{companyName}</p>
            <p className="text-[11px] leading-4 text-ink-soft">
              <time dateTime={job.created_at}>{job.posted_on}</time>
            </p>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={(e) => void toggleSave(e)}
            className={`relative z-10 inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              job.saved
                ? 'border-brand-border bg-brand-soft text-brand'
                : 'border-slate-200 bg-white text-ink-soft hover:border-slate-300 hover:text-ink'
            }`}
            aria-label={job.saved ? 'Unsave job' : 'Save job'}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill={job.saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M6 4h12a1 1 0 0 1 1 1v16l-7-4-7 4V5a1 1 0 0 1 1-1Z" />
            </svg>
          </button>
        </div>

        {/* Title — small, neat, stays ink (no red flash on hover) */}
        <h3 className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-ink">
          <Link
            to={`/jobs/${job.id}`}
            className="cursor-pointer after:absolute after:inset-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            title={job.title}
          >
            <span className="relative z-10 underline-offset-2 group-hover:underline">{job.title}</span>
          </Link>
        </h3>

        {/* Clear labeled details */}
        <dl className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
          {details.map((row) => (
            <div key={row.label} className="grid grid-cols-[4.75rem_1fr] items-baseline gap-2 text-xs leading-4">
              <dt className="font-medium text-ink-soft">{row.label}</dt>
              <dd className="truncate font-medium text-ink" title={row.title || row.value}>
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto pt-4">
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy || Boolean(job.applied)}
              onClick={(e) => void onApply(e)}
              className={`relative z-10 inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60 ${
                job.applied
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border border-slate-200 bg-white text-ink hover:border-brand hover:text-brand'
              }`}
            >
              {job.applied ? (
                'Applied'
              ) : external ? (
                <>
                  Apply
                  <svg className="h-3 w-3 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 4h6v6M10 14 20 4M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" />
                  </svg>
                </>
              ) : (
                'Apply'
              )}
            </button>
            <Link
              to={`/jobs/${job.id}`}
              className="relative z-10 inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-ink-muted transition duration-200 hover:border-slate-300 hover:text-ink"
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
