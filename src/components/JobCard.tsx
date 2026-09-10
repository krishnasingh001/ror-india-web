import { Link } from 'react-router-dom'
import type { Job } from '@/types'
import { companyInitial } from '@/lib/format'

type Props = { job: Job }

export function JobCard({ job }: Props) {
  const companyName = job.company?.name || 'Company'
  const applyHref = job.external_apply && job.job_url ? job.job_url : `/jobs/${job.id}`
  const external = Boolean(job.external_apply && job.job_url)

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-brand-border bg-brand-soft text-sm font-bold text-brand">
          {job.company?.logo_url ? (
            <img src={job.company.logo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            companyInitial(companyName)
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 min-h-[2.7em] text-[0.975rem] font-semibold leading-snug text-ink">
            <Link to={`/jobs/${job.id}`} className="transition hover:text-brand">
              {job.title}
            </Link>
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="pill">
              <BriefcaseIcon />
              <span className="truncate">{job.job_type}</span>
            </span>
            <span className="pill max-w-[11.5rem]" title={job.location || undefined}>
              <PinIcon />
              <span className="truncate">{job.location_short}</span>
            </span>
            <span className="pill pill-muted">
              <CalendarIcon />
              <time dateTime={job.created_at}>{job.posted_on}</time>
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-1 flex-wrap items-end gap-x-4 gap-y-2 text-sm text-ink-muted">
        {job.experience_label && (
          <span className="inline-flex items-center gap-1.5">
            <GradIcon />
            {job.experience_label}
          </span>
        )}
        {job.salary_label && (
          <span className="inline-flex items-center gap-1.5">
            <MoneyIcon />
            {job.salary_label}
          </span>
        )}
        <span className="truncate text-ink-soft">{companyName}</span>
      </div>

      <div className="mt-4">
        {external ? (
          <a
            href={applyHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full"
          >
            <ExternalIcon />
            Apply
          </a>
        ) : (
          <Link to={`/jobs/${job.id}`} className="btn-primary w-full">
            View role
          </Link>
        )}
      </div>
    </article>
  )
}

function BriefcaseIcon() {
  return (
    <svg className="h-3 w-3 shrink-0 text-ink-soft" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 6V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1" />
      <rect x="3" y="6" width="18" height="14" rx="2" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg className="h-3 w-3 shrink-0 text-ink-soft" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg className="h-3 w-3 shrink-0 text-ink-soft" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  )
}

function GradIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0 text-ink-soft" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m2 9 10-5 10 5-10 5L2 9Z" />
      <path d="M6 12v5c3 2 9 2 12 0v-5" />
    </svg>
  )
}

function MoneyIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0 text-ink-soft" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 4h6v6M10 14 20 4M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" />
    </svg>
  )
}
