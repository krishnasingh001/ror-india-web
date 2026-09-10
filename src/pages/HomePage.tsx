import { FormEvent, useEffect, useState } from 'react'
import { JobCard } from '@/components/JobCard'
import { fetchJobs } from '@/lib/api'
import type { Job, JobFilters } from '@/types'

export function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<JobFilters>({ page: 1 })
  const [keywords, setKeywords] = useState('')
  const [location, setLocation] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchJobs(filters)
      .then((res) => {
        if (cancelled) return
        setJobs(res.data)
        setTotal(res.meta.total_count)
      })
      .catch((err: Error) => {
        if (cancelled) return
        setError(err.message || 'Failed to load jobs')
        setJobs([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
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
      <section className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-br from-white via-brand-soft/40 to-slate-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.08),transparent_45%)]" />
        <div className="container-page relative py-14 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
            Ruby on Rails jobs in India
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Find your next <span className="text-brand">Rails role</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-ink-muted sm:text-lg">
            Curated opportunities from companies hiring Ruby on Rails developers.
          </p>
        </div>
      </section>

      <section className="container-page -mt-6 pb-16">
        <form
          onSubmit={onSearch}
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-card sm:p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              className="input-field"
              placeholder="Job title, skills, keywords…"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              aria-label="Search keywords"
            />
            <input
              className="input-field sm:max-w-xs"
              placeholder="City or remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              aria-label="Search location"
            />
            <button
              type="submit"
              className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-hover"
            >
              Search
            </button>
          </div>
        </form>

        <div className="mt-8 flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm shadow-sm">
            <span className="font-semibold text-ink">{loading ? '…' : total}</span>
            <span className="text-ink-muted">jobs found</span>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error}
            <p className="mt-1 text-amber-800/80">
              Start the Rails API on port 3000, or set <code className="font-mono">VITE_API_BASE_URL</code>.
            </p>
          </div>
        )}

        {loading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl border border-gray-200 bg-white" />
            ))}
          </div>
        ) : jobs.length === 0 && !error ? (
          <div className="mt-10 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-ink">No jobs found</h2>
            <p className="mt-2 text-sm text-ink-muted">Try a different keyword or location.</p>
          </div>
        ) : (
          <ul className="mt-6 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <li key={job.id} className="min-w-0">
                <JobCard job={job} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
