import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { JobCard } from '@/components/JobCard'
import { api } from '@/lib/api'
import { companyAvatarTone, companyInitial } from '@/lib/format'
import { useAuth } from '@/context/AuthContext'
import type { DashboardData } from '@/types'

function IconSearch({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="m20 20-3.5-3.5" />
    </svg>
  )
}

function IconUser({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  )
}

function IconPlane({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
    </svg>
  )
}

function IconGrid({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function IconBookmark({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12v17l-6-3.5L6 21V4Z" />
    </svg>
  )
}

function IconBuilding({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" d="M4 21h16M6 21V7l6-3 6 3v14M10 21v-5h4v5M9 10h.01M15 10h.01M9 14h.01M15 14h.01" />
    </svg>
  )
}

function IconArrow({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function IconPen({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
    </svg>
  )
}

const STAT_TONES = {
  blue: { wrap: 'bg-sky-50 text-sky-700', icon: 'text-sky-600' },
  green: { wrap: 'bg-emerald-50 text-emerald-700', icon: 'text-emerald-600' },
  amber: { wrap: 'bg-amber-50 text-amber-800', icon: 'text-amber-600' },
  slate: { wrap: 'bg-slate-100 text-slate-700', icon: 'text-slate-600' },
  red: { wrap: 'bg-brand-soft text-brand', icon: 'text-brand' },
} as const

function Panel({
  title,
  action,
  children,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="dash-panel">
      <div className="dash-panel-head">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .dashboard()
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="container-page py-10 sm:py-14">
        <div className="h-24 animate-pulse rounded-2xl bg-white" />
        <div className="mt-4 h-16 animate-pulse rounded-2xl bg-white" />
        <div className="mt-4 grid gap-3 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return <div className="container-page py-16 text-ink-muted">{error || 'Unable to load dashboard'}</div>
  }

  if (data.role === 'recruiter') {
    return <RecruiterDashboard data={data} />
  }

  const firstName = (data.user.name || user?.name || 'there').split(' ')[0]
  const greeting = data.greeting || 'Hello'
  const stats = data.stats || {}
  const profilePct = Number(stats.profile_completion || 0)
  const avatar = data.user.avatar || user?.avatar
  const initial = companyInitial(data.user.name || 'U')
  const trackedCount = Number(stats.external_applications ?? 0)

  const statCards = [
    {
      label: 'Tracked',
      value: String(trackedCount),
      to: '/track-applications',
      tone: 'blue' as const,
      icon: <IconGrid className="h-4 w-4" />,
    },
    {
      label: 'Saved',
      value: String(stats.saved_jobs ?? 0),
      to: '/saved-jobs',
      tone: 'amber' as const,
      icon: <IconBookmark className="h-4 w-4" />,
    },
    {
      label: 'Following',
      value: String(stats.followed_companies ?? 0),
      to: '/companies',
      tone: 'slate' as const,
      icon: <IconBuilding className="h-4 w-4" />,
    },
    {
      label: 'Profile',
      value: `${profilePct}%`,
      to: '/profile',
      tone: (profilePct >= 80 ? 'green' : 'red') as 'green' | 'red',
      icon: <IconUser className="h-4 w-4" />,
    },
  ]

  const quickLinks = [
    { to: '/track-applications', label: 'Track Applications', icon: <IconGrid className="h-5 w-5" /> },
    { to: '/saved-jobs', label: 'Saved jobs', icon: <IconBookmark className="h-5 w-5" /> },
    { to: '/companies', label: 'Companies', icon: <IconBuilding className="h-5 w-5" /> },
  ]

  return (
    <div className="container-page py-8 sm:py-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-brand-soft text-lg font-bold text-brand">
            {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : initial}
          </div>
          <div>
            <p className="text-sm text-slate-500">
              {greeting}, {firstName}
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Your job search hub</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/" className="btn-primary !py-2.5">
            <IconSearch />
            Find jobs
          </Link>
          <Link to="/profile" className="btn-secondary !py-2.5">
            <IconUser />
            Profile
          </Link>
        </div>
      </header>

      {profilePct < 100 && (
        <div className="dash-panel mt-6 !py-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-slate-600">Profile completion</span>
            <strong className="text-ink">{profilePct}%</strong>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, profilePct))}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const tone = STAT_TONES[stat.tone]
          return (
            <Link
              key={stat.label}
              to={stat.to}
              className="card-surface flex cursor-pointer flex-col gap-3 p-4 transition duration-200 hover:border-slate-400 hover:shadow-card-hover"
            >
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${tone.wrap}`}>
                <span className={tone.icon}>{stat.icon}</span>
              </span>
              <span className="text-2xl font-bold tracking-tight text-ink">{stat.value}</span>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{stat.label}</span>
            </Link>
          )
        })}
      </div>

      <nav className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Quick access">
        {quickLinks.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="card-surface flex cursor-pointer items-center gap-3 px-4 py-4 transition duration-200 hover:border-brand-border hover:bg-brand-soft/40"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
              {item.icon}
            </span>
            <span className="text-sm font-semibold text-ink">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <Panel
            title="Track Applications"
            action={<Link to="/track-applications" className="dash-panel-link">Open board</Link>}
          >
            {(data.recent_external_applications || []).length > 0 ? (
              <ul className="dash-list">
                {data.recent_external_applications!.map((application) => (
                  <li key={application.id} className="dash-list-item">
                    <div className="min-w-0 flex-1">
                      <p className="dash-list-title line-clamp-1">{application.job_title}</p>
                      <p className="dash-list-meta">
                        {application.company_name}
                        <span className="mx-1.5 text-slate-300">·</span>
                        {application.status_display}
                        <span className="mx-1.5 text-slate-300">·</span>
                        {application.source_display}
                      </p>
                    </div>
                    {application.job_url ? (
                      <a
                        href={application.job_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dash-list-action"
                        aria-label="Open application"
                      >
                        <IconArrow />
                      </a>
                    ) : (
                      <Link to="/track-applications" className="dash-list-action" aria-label="Open board">
                        <IconArrow />
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="dash-panel-empty">
                <p>Track every role you’ve applied to — LinkedIn, Naukri, ROR India, and more.</p>
                <Link to="/track-applications" className="dash-panel-link mt-3 inline-block">
                  Open board
                </Link>
              </div>
            )}
          </Panel>

          <Panel
            title="Blog posts"
            action={
              <Link to="/my-blog-posts" className="dash-panel-link">
                Manage
              </Link>
            }
          >
            {(data.recent_blog_posts || []).length > 0 ? (
              <ul className="dash-list">
                {data.recent_blog_posts!.map((post) => (
                  <li key={post.id} className="dash-list-item">
                    <div className="min-w-0 flex-1">
                      <Link to={`/blog/${post.slug}`} className="dash-list-title line-clamp-2">
                        {post.title}
                      </Link>
                      <p className="dash-list-meta">
                        <span className={`dash-badge dash-badge--${post.status}`}>{post.status}</span>
                        <span className="mx-1.5 text-slate-300">·</span>
                        {post.created_on}
                      </p>
                    </div>
                    <Link to={`/blog/${post.slug}/edit`} className="dash-list-action" aria-label="Edit post">
                      <IconPen />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="dash-panel-empty">
                <p>Share Rails tips and hiring notes with the community.</p>
                <Link to="/blog/new" className="dash-panel-link mt-3 inline-block">
                  Write a post
                </Link>
              </div>
            )}
          </Panel>
        </div>

        <aside className="space-y-5">
          <Panel title="Saved jobs" action={<Link to="/saved-jobs" className="dash-panel-link">View all</Link>}>
            {(data.recent_saved_jobs || []).length > 0 ? (
              <ul className="dash-list">
                {data.recent_saved_jobs!.map((saved) => (
                  <li key={saved.id} className="dash-list-item">
                    <div className="min-w-0 flex-1">
                      <Link to={`/jobs/${saved.job.id}`} className="dash-list-title line-clamp-1">
                        {saved.job.title}
                      </Link>
                      <p className="dash-list-meta">{saved.job.company?.name || 'Company'}</p>
                    </div>
                    <Link to={`/jobs/${saved.job.id}`} className="dash-list-action" aria-label="View job">
                      <IconPlane />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="dash-panel-empty">
                <p>No saved jobs.</p>
                <Link to="/" className="dash-panel-link mt-3 inline-block">
                  Browse jobs
                </Link>
              </div>
            )}
          </Panel>

          <Panel title="Following" action={<Link to="/companies" className="dash-panel-link">Discover</Link>}>
            {(data.followed_companies || []).length > 0 ? (
              <ul className="m-0 list-none space-y-1 p-0">
                {data.followed_companies!.map((company) => {
                  const tone = companyAvatarTone(company.name)
                  return (
                    <li key={company.id}>
                      <Link
                        to={`/companies/${company.id}`}
                        className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2.5 transition duration-200 hover:bg-slate-50"
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 ${tone.bg} ${tone.text}`}
                        >
                          {company.logo_url ? (
                            <img src={company.logo_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold">{companyInitial(company.name)}</span>
                          )}
                        </span>
                        <span className="truncate text-sm font-semibold text-ink">{company.name}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="dash-panel-empty">
                <p>Follow companies for updates.</p>
                <Link to="/companies" className="dash-panel-link mt-3 inline-block">
                  Browse companies
                </Link>
              </div>
            )}
          </Panel>
        </aside>
      </div>
    </div>
  )
}

function RecruiterDashboard({ data }: { data: DashboardData }) {
  return (
    <div className="container-page py-8 sm:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">Recruiter</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">Hiring dashboard</h1>
        </div>
        <Link to="/" className="btn-primary">
          Browse talent jobs
        </Link>
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="card-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Posted jobs</p>
          <p className="mt-2 text-3xl font-bold text-ink">{data.stats.posted_jobs ?? 0}</p>
        </div>
        <div className="card-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Applications</p>
          <p className="mt-2 text-3xl font-bold text-ink">{data.stats.applications ?? 0}</p>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-ink">Your recent postings</h2>
        <ul className="mt-4 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {(data.recent_jobs || []).map((job) => (
            <li key={job.id}>
              <JobCard job={job} />
            </li>
          ))}
        </ul>
        {!data.recent_jobs?.length && <p className="mt-4 text-sm text-ink-muted">No jobs posted yet.</p>}
      </section>
    </div>
  )
}
