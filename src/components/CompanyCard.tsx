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

  const meta = [company.company_type, company.location_short].filter(Boolean).join(' · ')

  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-slate-300 bg-white transition-colors duration-200 ease-out hover:border-slate-400 hover:bg-slate-50/40">
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 ${tone.bg} ${tone.text}`}>
            {company.logo_url ? (
              <img src={company.logo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-[11px] font-bold leading-none">{companyInitial(company.name)}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[13px] font-semibold leading-[1.35] text-slate-900">
              <Link
                to={`/companies/${company.id}`}
                className="cursor-pointer after:absolute after:inset-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <span className="relative z-10">{company.name}</span>
              </Link>
            </h3>
            {meta && <p className="mt-1 truncate text-[12px] text-slate-600">{meta}</p>}
          </div>
        </div>

        <p className="text-[12px] text-slate-600">
          <span className="font-semibold text-slate-900">{jobsCount}</span> open {jobsCount === 1 ? 'role' : 'roles'}
        </p>

        <div className="mt-auto flex items-center gap-2 border-t border-slate-200 pt-3">
          <Link
            to={`/companies/${company.id}`}
            className="relative z-10 inline-flex flex-1 cursor-pointer items-center justify-center rounded-md border border-brand bg-brand px-3 py-2 text-[12px] font-semibold text-white transition-colors duration-200 hover:bg-brand-hover"
          >
            View jobs
          </Link>
          <button
            type="button"
            disabled={busy}
            onClick={(e) => void toggleFollow(e)}
            className={`relative z-10 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              company.followed
                ? 'border-brand bg-brand-soft text-brand'
                : 'border-slate-300 bg-white text-slate-500 hover:border-slate-400 hover:text-slate-800'
            }`}
            aria-label={company.followed ? 'Unfollow company' : 'Follow company'}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
