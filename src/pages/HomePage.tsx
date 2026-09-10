import { FormEvent, useEffect, useState } from 'react'
import { JobCard } from '@/components/JobCard'
import { api } from '@/lib/api'
import type { Job, JobFilters } from '@/types'

export function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<JobFilters>({ page: 1, sort_by: 'newest' })
  const [keywords, setKeywords] = useState('')
  const [location, setLocation] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    api.fetchJobs(filters)
      .then((res) => {
        if (cancelled) return
        setJobs(res.data)
        setTotal(res.meta.total_count)
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load jobs')
          setJobs([])
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [filters])

  function onSearch(e: FormEvent) {
    e.preventDefault()
    setFilters((prev) => ({
      ...prev,
      search_keywords: keywords.trim() || undefined,
      search_location: location.trim() || undefined,
      page: 1,
    }))
  }

  return (
    <div>
      <section className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(180deg,#fff_0%,#FEF2F2_45%,#F8FAFC_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(220,38,38,0.12),transparent_40%)]" />
        <div className="container-page relative py-14 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">Ruby on Rails jobs in India</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Find your next <span className="text-brand">Rails role</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-ink-muted sm:text-lg">
            Search curated openings, save roles, and apply — built for the Rails community.
          </p>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-sm">
            {[
              ['Curated', 'Rails-first listings'],
              ['Companies', 'Follow hiring teams'],
              ['Track', 'Saved + applications'],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl border border-white/70 bg-white/70 p-3 shadow-card backdrop-blur">
                <p className="font-semibold text-ink">{t}</p>
                <p className="mt-1 text-ink-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page -mt-8 pb-16">
        <form onSubmit={onSearch} className="card-surface p-4 shadow-panel sm:p-5" role="search" aria-label="Search jobs">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="flex-1">
              <label htmlFor="keywords" className="sr-only">Keywords</label>
              <input id="keywords" className="input-field" placeholder="Job title, skills, keywords…" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
            </div>
            <div className="lg:w-56">
              <label htmlFor="location" className="sr-only">Location</label>
              <input id="location" className="input-field" placeholder="City or remote" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="lg:w-44">
              <label htmlFor="sort" className="sr-only">Sort by</label>
              <select id="sort" className="input-field cursor-pointer" value={filters.sort_by || 'newest'} onChange={(e) => setFilters((p) => ({ ...p, sort_by: e.target.value, page: 1 }))}>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="salary_high">Salary high</option>
                <option value="salary_low">Salary low</option>
              </select>
            </div>
            <button type="submit" className="btn-primary lg:px-6">Search</button>
          </div>
        </form>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm">
            <span className="font-semibold text-ink">{loading ? '…' : total}</span>
            <span className="text-ink-muted">jobs found</span>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error}
            <p className="mt-1 text-amber-800/80">Start Rails on :3000 so the Vite proxy can reach /api/v1.</p>
          </div>
        )}

        {loading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}
          </div>
        ) : jobs.length === 0 && !error ? (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-ink">No jobs found</h2>
            <p className="mt-2 text-sm text-ink-muted">Try different keywords or clear filters.</p>
          </div>
        ) : (
          <ul className="mt-6 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <li key={job.id} className="min-w-0">
                <JobCard job={job} onChange={(next) => setJobs((prev) => prev.map((j) => (j.id === next.id ? next : j)))} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
