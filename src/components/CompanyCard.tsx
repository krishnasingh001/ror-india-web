import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { companyInitial } from '@/lib/format'
import { useAuth } from '@/context/AuthContext'
import type { Company } from '@/types'

type Props = { company: Company; onChange?: (c: Company) => void }

export function CompanyCard({ company, onChange }: Props) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  async function toggleFollow() {
    if (!user) return navigate('/sign-in', { state: { from: `/companies/${company.id}` } })
    setBusy(true)
    try {
      const res = company.followed ? await api.unfollowCompany(company.id) : await api.followCompany(company.id)
      onChange?.({ ...company, followed: res.followed })
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="card-surface flex h-full flex-col p-4 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-start gap-3">
        <Link to={`/companies/${company.id}`} className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-brand-border bg-brand-soft text-sm font-bold text-brand">
          {company.logo_url ? <img src={company.logo_url} alt="" className="h-full w-full object-cover" /> : companyInitial(company.name)}
        </Link>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-[0.975rem] font-semibold leading-snug text-ink">
            <Link to={`/companies/${company.id}`} className="cursor-pointer transition duration-200 hover:text-brand">{company.name}</Link>
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {company.company_type && <span className="pill">{company.company_type}</span>}
            {company.location_short && <span className="pill max-w-[10.5rem]">{company.location_short}</span>}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-1 items-end text-sm text-ink-muted">
        <span>{company.active_jobs_count ?? 0} {(company.active_jobs_count ?? 0) === 1 ? 'job' : 'jobs'}</span>
      </div>
      <div className="mt-4 flex gap-2">
        <Link to={`/companies/${company.id}`} className="btn-secondary flex-1">View jobs</Link>
        <button type="button" disabled={busy} onClick={() => void toggleFollow()} className={`btn-ghost ${company.followed ? '!border-brand-border !bg-brand-soft !text-brand' : ''}`} aria-label={company.followed ? 'Unfollow' : 'Follow'}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="3" /><path d="M19 8v6M22 11h-6" /></svg>
        </button>
      </div>
    </article>
  )
}
