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
    if (!user) return navigate('/sign-in', { state: { from: `/jobs/${job.id}` } })

    if (external && job.job_url) {
      setBusy(true)
      try {
        await api.trackExternalJob(job.id)
        onChange?.({ ...job, applied: true })
        window.open(job.job_url, '_blank', 'noopener,noreferrer')
      } catch (err: unknown) {
        const e2 = err as { message?: string }
        alert(e2.message || 'Could not track this application.')
      } finally {
        setBusy(false)
      }
      return
    }

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

  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-slate-300 bg-white transition-colors duration-200 ease-out hover:border-slate-400 hover:bg-slate-50/40">
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 ${tone.bg} ${tone.text}`}
          >
            {job.company?.logo_url ? (
              <img src={job.company.logo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-[11px] font-bold leading-none">{companyInitial(companyName)}</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-[11px] font-semibold uppercase tracking-[0.04em] text-slate-500">
                {companyName}
              </p>
              <span className="text-[11px] text-slate-300" aria-hidden="true">
                ·
              </span>
              <time dateTime={job.created_at} className="shrink-0 text-[11px] text-slate-500">
                {job.posted_on}
              </time>
            </div>

            <h3 className="mt-1 line-clamp-2 text-[13px] font-semibold leading-[1.35] text-slate-900">
              <Link
                to={`/jobs/${job.id}`}
                className="cursor-pointer after:absolute after:inset-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                title={job.title}
              >
                <span className="relative z-10">{job.title}</span>
              </Link>
            </h3>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={(e) => void toggleSave(e)}
            className={`relative z-10 -mr-1 -mt-1 inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              job.saved
                ? 'border-brand bg-brand-soft text-brand'
                : 'border-slate-300 bg-white text-slate-500 hover:border-slate-400 hover:text-slate-800'
            }`}
            aria-label={job.saved ? 'Unsave job' : 'Save job'}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill={job.saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M6 4h12a1 1 0 0 1 1 1v16l-7-4-7 4V5a1 1 0 0 1 1-1Z" />
            </svg>
          </button>
        </div>

        {/* Meta — one crisp line */}
        <ul className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] leading-4 text-slate-600">
          <li className="inline-flex items-center gap-1.5">
            <BriefcaseIcon />
            <span>{job.job_type}</span>
          </li>
          <li className="inline-flex min-w-0 items-center gap-1.5" title={job.location || undefined}>
            <PinIcon />
            <span className="truncate">{job.location_short}</span>
          </li>
          {job.experience_label && (
            <li className="inline-flex items-center gap-1.5">
              <UserIcon />
              <span>{job.experience_label}</span>
            </li>
          )}
          {job.salary_label && (
            <li className="inline-flex items-center gap-1.5 font-medium text-slate-800">
              <MoneyIcon />
              <span>{job.salary_label}</span>
            </li>
          )}
        </ul>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2 border-t border-slate-200 pt-3">
          <Link
            to={`/jobs/${job.id}`}
            className="relative z-10 inline-flex flex-1 cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-[12px] font-medium text-slate-700 transition-colors duration-200 hover:border-slate-400 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            View role
          </Link>
          <button
            type="button"
            disabled={busy || Boolean(job.applied)}
            onClick={(e) => void onApply(e)}
            className={`relative z-10 inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[12px] font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60 ${
              job.applied
                ? 'border border-emerald-300 bg-emerald-50 text-emerald-700'
                : 'border border-brand/40 bg-brand-soft text-brand hover:border-brand hover:bg-white'
            }`}
          >
            {job.applied ? (
              'Applied'
            ) : (
              <>
                Apply
                {external && (
                  <svg className="h-3 w-3 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 4h6v6M10 14 20 4M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" />
                  </svg>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  )
}

function BriefcaseIcon() {
  return (
    <svg className="h-3 w-3 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M9 6V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1" />
      <rect x="3" y="6" width="18" height="14" rx="2" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg className="h-3 w-3 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg className="h-3 w-3 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="3" />
    </svg>
  )
}

function MoneyIcon() {
  return (
    <svg className="h-3 w-3 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  )
}
