import { Link } from 'react-router-dom'
import type { Company } from '@/types'
import { companyInitial } from '@/lib/format'

type Props = { company: Company }

export function CompanyCard({ company }: Props) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-start gap-3">
        <Link
          to={`/companies/${company.id}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-brand-border bg-brand-soft text-sm font-bold text-brand"
        >
          {company.logo_url ? (
            <img src={company.logo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            companyInitial(company.name)
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-[0.975rem] font-semibold leading-snug text-ink">
            <Link to={`/companies/${company.id}`} className="transition hover:text-brand">
              {company.name}
            </Link>
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {company.company_type && (
              <span className="pill">
                <BuildingIcon />
                <span className="truncate">{company.company_type}</span>
              </span>
            )}
            {company.location_short && (
              <span className="pill max-w-[10.5rem]" title={company.headquarter || undefined}>
                <PinIcon />
                <span className="truncate">{company.location_short}</span>
              </span>
            )}
            {company.founded_year && (
              <span className="pill pill-muted">{company.founded_year}</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-1 flex-wrap items-end gap-x-4 gap-y-2 text-sm text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <BriefcaseIcon />
          {company.active_jobs_count} {company.active_jobs_count === 1 ? 'job' : 'jobs'}
        </span>
        {(company.min_size || company.max_size) && (
          <span className="inline-flex items-center gap-1.5">
            <UsersIcon />
            {company.min_size}
            {company.max_size ? `–${company.max_size}` : ''} employees
          </span>
        )}
      </div>

      <div className="mt-4">
        <Link to={`/companies/${company.id}`} className="btn-primary w-full">
          <BriefcaseIcon />
          View jobs
        </Link>
      </div>
    </article>
  )
}

function BuildingIcon() {
  return (
    <svg className="h-3 w-3 shrink-0 text-ink-soft" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14 9h5a1 1 0 0 1 1 1v11M8 8h2M8 12h2M8 16h2" />
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

function BriefcaseIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 6V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1" />
      <rect x="3" y="6" width="18" height="14" rx="2" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0 text-ink-soft" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="3" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
