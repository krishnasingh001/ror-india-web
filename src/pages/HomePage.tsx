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

  const [email, setEmail] = useState('')
  const [subscribeBusy, setSubscribeBusy] = useState(false)
  const [subscribeMsg, setSubscribeMsg] = useState<string | null>(null)
  const [subscribeErr, setSubscribeErr] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    api
      .fetchJobs(filters)
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

  async function onSubscribe(e: FormEvent) {
    e.preventDefault()
    setSubscribeBusy(true)
    setSubscribeMsg(null)
    setSubscribeErr(null)
    try {
      const res = await api.subscribe(email.trim())
      setSubscribeMsg(res.message || 'Subscribed successfully.')
      setEmail('')
    } catch (err: unknown) {
      const e2 = err as { message?: string }
      setSubscribeErr(e2.message || 'Could not subscribe.')
    } finally {
      setSubscribeBusy(false)
    }
  }

  return (
    <div>
      {/* Centered newsletter hero — matches reference */}
      <section className="hero-surface">
        <div className="container-page flex flex-col items-center px-4 py-16 text-center sm:py-20 lg:py-24">
          <span className="inline-flex items-center rounded-full bg-brand-soft px-3.5 py-1 text-xs font-semibold text-brand">
            Ruby on Rails jobs in India
          </span>

          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl sm:leading-tight">
            Find your next <span className="text-brand">Rails role</span>
          </h1>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Discover curated opportunities from companies hiring Ruby on Rails developers across
            India.
          </p>

          <form
            onSubmit={(e) => void onSubscribe(e)}
            className="mt-8 flex w-full max-w-xl flex-col gap-2 sm:flex-row sm:items-center sm:rounded-full sm:border sm:border-slate-300 sm:bg-white sm:p-1.5 sm:shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
            aria-labelledby="newsletter-heading"
          >
            <p id="newsletter-heading" className="sr-only">
              Get weekly job alerts
            </p>
            <label htmlFor="alert-email" className="sr-only">
              Email for weekly job alerts
            </label>
            <input
              id="alert-email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              placeholder="Email for weekly job alerts"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-full border border-slate-300 bg-white px-5 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15 sm:h-11 sm:flex-1 sm:border-0 sm:bg-transparent sm:px-4 sm:focus:ring-0"
            />
            <button
              type="submit"
              disabled={subscribeBusy}
              className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white transition duration-200 hover:bg-brand-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 sm:shrink-0"
            >
              {subscribeBusy ? 'Subscribing…' : 'Get alerts'}
            </button>
          </form>

          <p className="mt-3 text-xs text-slate-500">Curated Rails roles. Unsubscribe anytime.</p>

          {(subscribeMsg || subscribeErr) && (
            <p
              className={`mt-3 text-sm ${subscribeErr ? 'text-brand' : 'text-emerald-700'}`}
              role="status"
            >
              {subscribeErr || subscribeMsg}
            </p>
          )}
        </div>
      </section>

      {/* Search + listings */}
      <section className="container-page relative py-8 pb-16">
        <form
          onSubmit={onSearch}
          className="rounded-xl border border-slate-300 bg-white p-3 sm:p-4"
          role="search"
          aria-label="Search jobs"
        >
          <div className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
            <div className="min-w-0 flex-1">
              <label htmlFor="keywords" className="sr-only">
                Keywords
              </label>
              <input
                id="keywords"
                className="input-field"
                placeholder="Job title, skills, keywords…"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>
            <div className="lg:w-52">
              <label htmlFor="location" className="sr-only">
                Location
              </label>
              <input
                id="location"
                className="input-field"
                placeholder="City or remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="lg:w-40">
              <label htmlFor="sort" className="sr-only">
                Sort by
              </label>
              <select
                id="sort"
                className="input-field cursor-pointer"
                value={filters.sort_by || 'newest'}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, sort_by: e.target.value, page: 1 }))
                }
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="salary_high">Salary high</option>
                <option value="salary_low">Salary low</option>
              </select>
            </div>
            <button type="submit" className="btn-primary shrink-0 lg:px-6">
              Search
            </button>
          </div>
        </form>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm">
            <span className="font-semibold text-ink">{loading ? '…' : total}</span>
            <span className="text-ink-muted">jobs found</span>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error}
            <p className="mt-1 text-amber-800/80">
              Start Rails on :3000 so the Vite proxy can reach /api/v1.
            </p>
          </div>
        )}

        {loading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-xl border border-slate-300 bg-white" />
            ))}
          </div>
        ) : jobs.length === 0 && !error ? (
          <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <h2 className="text-base font-semibold text-ink">No jobs found</h2>
            <p className="mt-2 text-sm text-ink-muted">Try different keywords or clear filters.</p>
          </div>
        ) : (
          <ul className="mt-6 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <li key={job.id} className="min-w-0">
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
      </section>
    </div>
  )
}
