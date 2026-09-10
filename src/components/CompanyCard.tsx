import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { companyAvatarTone, companyInitial } from '@/lib/format'
import { useAuth } from '@/context/AuthContext'
import type { Company } from '@/types'

type Props = { company: Company; onChange?: (c: Company) => void }

export function CompanyCard({ company, onChange }: Props) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const tone = companyAvatarTone(company.name)
  const jobsCount = company.active_jobs_count ?? 0

  async function toggleFollow(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return navigate('/sign-in', { state: { from: `/companies/${company.id}` } })
    setBusy(true)
    try {
      const res = company.followed
        ? await api.unfollowCompany(company.id)
        : await api.followCompany(company.id)
      onChange?.({ ...company, followed: res.followed })
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white transition duration-200 ease-out hover:border-slate-300 hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
      <div className="h-1 w-full bg-gradient-to-r from-brand/80 via-brand/40 to-transparent opacity-0 transition duration-200 group-hover:opacity-100" />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}>
            {company.logo_url ? (
              <img src={company.logo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-base font-bold tracking-tight">{companyInitial(company.name)}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold tracking-tight text-ink">
              <Link
                to={`/companies/${company.id}`}
                className="cursor-pointer after:absolute after:inset-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <span className="relative z-10 transition duration-200 group-hover:text-brand">{company.name}</span>
              </Link>
            </h3>
            <p className="mt-0.5 truncate text-sm text-ink-muted">
              {[company.company_type, company.location_short].filter(Boolean).join(' · ') || 'Rails company'}
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm text-ink-muted">
          <span className="font-semibold text-ink">{jobsCount}</span>{' '}
          open {jobsCount === 1 ? 'role' : 'roles'}
        </p>

        <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-4">
          <Link
            to={`/companies/${company.id}`}
            className="relative z-10 inline-flex flex-1 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink transition duration-200 hover:border-brand hover:bg-brand-soft hover:text-brand"
          >
            View jobs
          </Link>
          <button
            type="button"
            disabled={busy}
            onClick={(e) => void toggleFollow(e)}
            className={`relative z-10 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              company.followed
                ? 'border-brand-border bg-brand-soft text-brand'
                : 'border-slate-200 bg-white text-ink-soft hover:border-slate-300 hover:text-ink'
            }`}
            aria-label={company.followed ? 'Unfollow company' : 'Follow company'}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="3" />
              <path d="M19 8v6M22 11h-6" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  )
}
