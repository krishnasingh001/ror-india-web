import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { JobCard } from '@/components/JobCard'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { companyAvatarTone, companyInitial, companySizeLabel } from '@/lib/format'
import type { Company, Job } from '@/types'

type TabId = 'home' | 'about' | 'jobs'

export function CompanyShowPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [company, setCompany] = useState<Company | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [tab, setTab] = useState<TabId>('home')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    api
      .fetchCompany(id)
      .then((res) => {
        setCompany(res.data)
        setJobs(res.jobs)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  async function toggleFollow() {
    if (!company) return
    if (!user) return navigate('/sign-in', { state: { from: `/companies/${company.id}` } })
    setBusy(true)
    try {
      const res = company.followed
        ? await api.unfollowCompany(company.id)
        : await api.followCompany(company.id)
      setCompany({
        ...company,
        followed: res.followed,
        followers_count: Math.max(
          0,
          (company.followers_count ?? 0) + (res.followed ? 1 : -1),
        ),
      })
    } finally {
      setBusy(false)
    }
  }

  const tone = useMemo(
    () => companyAvatarTone(company?.name || 'Company'),
    [company?.name],
  )
  const sizeLabel = companySizeLabel(company?.min_size, company?.max_size)
  const jobsCount = company?.active_jobs_count ?? jobs.length
  const followersCount = company?.followers_count ?? 0

  if (loading) {
    return (
      <div>
        <div className="h-36 animate-pulse bg-slate-200/70 sm:h-44" />
        <div className="container-page -mt-10 pb-16">
          <div className="h-72 animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="container-page py-16">
        <p className="text-ink-muted">{error || 'Company not found'}</p>
        <Link to="/companies" className="mt-4 inline-block font-semibold text-brand">
          Back to companies
        </Link>
      </div>
    )
  }

  const overviewFacts = [
    { label: 'Industry', value: company.company_type || 'Ruby on Rails' },
    { label: 'Headquarters', value: company.headquarter || company.location_short },
    { label: 'Company size', value: sizeLabel },
    { label: 'Founded', value: company.founded_year ? String(company.founded_year) : null },
    {
      label: 'Website',
      value: company.website,
      href: company.website || undefined,
    },
    {
      label: 'Careers',
      value: company.career_page_url ? 'Career page' : null,
      href: company.career_page_url || undefined,
    },
    {
      label: 'LinkedIn',
      value: company.linkedin_url ? 'Company page' : null,
      href: company.linkedin_url || undefined,
    },
  ].filter((f) => f.value)

  return (
    <div className="pb-16">
      {/* Cover */}
      <div className="company-cover relative overflow-hidden">
        <div className="absolute inset-0 opacity-40" aria-hidden="true">
          <div className="absolute -left-10 top-0 h-48 w-48 rounded-full bg-brand/25 blur-3xl" />
          <div className="absolute bottom-0 right-10 h-40 w-64 rounded-full bg-rose-300/30 blur-3xl" />
        </div>
        <div className="container-page relative flex h-36 items-start pt-5 sm:h-44">
          <Link
            to="/companies"
            className="rounded-lg bg-white/80 px-3 py-1.5 text-sm font-semibold text-ink-muted backdrop-blur transition hover:text-brand"
          >
            ← All companies
          </Link>
        </div>
      </div>

      <div className="container-page relative -mt-12 sm:-mt-14">
        {/* Profile header */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div
                className={`-mt-16 flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white shadow-md sm:-mt-20 sm:h-28 sm:w-28 ${tone.bg} ${tone.text}`}
              >
                {company.logo_url ? (
                  <img src={company.logo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold">{companyInitial(company.name)}</span>
                )}
              </div>
              <div className="min-w-0 pb-1">
                <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                  {company.name}
                </h1>
                <p className="mt-1 text-sm font-medium text-ink-muted">
                  {company.company_type || 'Ruby on Rails company'}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                  {(company.headquarter || company.location_short) && (
                    <span className="inline-flex items-center gap-1.5">
                      <PinIcon />
                      {company.headquarter || company.location_short}
                    </span>
                  )}
                  {sizeLabel && (
                    <span className="inline-flex items-center gap-1.5">
                      <UsersIcon />
                      {sizeLabel}
                    </span>
                  )}
                  {company.founded_year && (
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarIcon />
                      Founded {company.founded_year}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary !py-2"
                >
                  Visit website
                </a>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => void toggleFollow()}
                className={company.followed ? 'btn-secondary !py-2' : 'btn-primary !py-2'}
              >
                {company.followed ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <nav
            className="mt-6 flex gap-1 overflow-x-auto border-t border-slate-200 pt-3"
            aria-label="Company sections"
          >
            {(
              [
                { id: 'home', label: 'Home' },
                { id: 'about', label: 'About' },
                { id: 'jobs', label: 'Jobs', badge: jobsCount },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={[
                  'inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition',
                  tab === item.id
                    ? 'bg-brand-soft text-brand'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-ink',
                ].join(' ')}
              >
                {item.label}
                {'badge' in item && item.badge != null && item.badge > 0 && (
                  <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0 space-y-6">
            {(tab === 'home' || tab === 'about') && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
                <h2 className="text-lg font-bold tracking-tight text-ink">
                  {tab === 'about' ? `About ${company.name}` : 'Overview'}
                </h2>
                {tab === 'about' && (
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {company.name} is hiring Ruby on Rails talent
                    {company.company_type ? ` in ${company.company_type}` : ''}
                    {company.headquarter || company.location_short
                      ? `, based in ${company.headquarter || company.location_short}`
                      : ''}
                    . Follow the company to stay updated on new roles.
                  </p>
                )}
                <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                  {overviewFacts.map((fact) => (
                    <div key={fact.label} className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {fact.label}
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-ink">
                        {fact.href ? (
                          <a
                            href={fact.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand hover:underline"
                          >
                            {fact.value}
                          </a>
                        ) : (
                          fact.value
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {/* Jobs on Home (bottom) and Jobs tab */}
            {(tab === 'home' || tab === 'jobs') && (
              <section id="open-roles" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-ink">Open roles</h2>
                    <p className="mt-1 text-sm text-ink-muted">
                      {jobsCount > 0
                        ? `${jobsCount} active ${jobsCount === 1 ? 'role' : 'roles'} at ${company.name}`
                        : `No open Rails roles at ${company.name} right now`}
                    </p>
                  </div>
                  {tab === 'home' && jobsCount > 0 && (
                    <button
                      type="button"
                      className="text-sm font-semibold text-brand hover:underline"
                      onClick={() => setTab('jobs')}
                    >
                      View all jobs
                    </button>
                  )}
                </div>

                {jobs.length === 0 ? (
                  <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-5 py-10 text-center">
                    <p className="text-sm text-ink-muted">
                      Check back soon, or follow {company.name} for openings.
                    </p>
                    {!company.followed && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void toggleFollow()}
                        className="btn-primary mt-4"
                      >
                        Follow company
                      </button>
                    )}
                  </div>
                ) : (
                  <ul className="mt-5 grid list-none gap-4 p-0 sm:grid-cols-2">
                    {(tab === 'home' ? jobs.slice(0, 6) : jobs).map((job) => (
                      <li key={job.id}>
                        <JobCard
                          job={job}
                          onChange={(next) =>
                            setJobs((prev) => prev.map((j) => (j.id === next.id ? next : j)))
                          }
                        />
                      </li>
                    ))}
                  </ul>
                )}

                {tab === 'home' && jobs.length > 6 && (
                  <div className="mt-5 text-center">
                    <button type="button" className="btn-secondary" onClick={() => setTab('jobs')}>
                      See all {jobs.length} roles
                    </button>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <h3 className="text-sm font-bold tracking-tight text-ink">Company insights</h3>
              <ul className="mt-4 space-y-3">
                <InsightRow label="Open positions" value={String(jobsCount)} />
                <InsightRow label="Followers" value={String(followersCount)} />
                {company.founded_year && (
                  <InsightRow label="Founded" value={String(company.founded_year)} />
                )}
                {sizeLabel && <InsightRow label="Team size" value={sizeLabel.replace(' employees', '')} />}
              </ul>
            </div>

            {(company.website || company.linkedin_url || company.career_page_url) && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                <h3 className="text-sm font-bold tracking-tight text-ink">Links</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {company.website && (
                    <li>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-brand hover:underline"
                      >
                        Website
                      </a>
                    </li>
                  )}
                  {company.career_page_url && (
                    <li>
                      <a
                        href={company.career_page_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-brand hover:underline"
                      >
                        Careers
                      </a>
                    </li>
                  )}
                  {company.linkedin_url && (
                    <li>
                      <a
                        href={company.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-brand hover:underline"
                      >
                        LinkedIn
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

function InsightRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between gap-3 text-sm">
      <span className="text-ink-muted">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </li>
  )
}

function PinIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="3.5" />
      <path strokeLinecap="round" d="M19 8a3 3 0 0 1 0 6M21 21v-1.5a3.5 3.5 0 0 0-2.5-3.35" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path strokeLinecap="round" d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  )
}
