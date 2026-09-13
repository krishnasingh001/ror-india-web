import { FormEvent, useEffect, useRef, useState } from 'react'
import { JobCard } from '@/components/JobCard'
import { Pagination } from '@/components/Pagination'
import { SelectMenu } from '@/components/SelectMenu'
import { api } from '@/lib/api'
import type { Job, JobFilters } from '@/types'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'salary_high', label: 'Salary high' },
  { value: 'salary_low', label: 'Salary low' },
]

export function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<JobFilters>({ page: 1, sort_by: 'newest' })
  const [keywords, setKeywords] = useState('')
  const [location, setLocation] = useState('')
  const listRef = useRef<HTMLElement>(null)

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
        setTotalPages(res.meta.total_pages)
        setPerPage(res.meta.per_page)
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

  function goToPage(page: number) {
    setFilters((prev) => ({ ...prev, page }))
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

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
      <section className="hero-surface">
        <div className="container-page flex flex-col items-center px-4 pb-5 pt-6 text-center sm:pb-6 sm:pt-8">
          <span className="inline-flex items-center rounded-full bg-brand-soft px-3 py-1 text-[11px] font-semibold text-brand">
            Ruby on Rails jobs in India
          </span>

          <h1 className="mt-3 max-w-2xl text-[1.75rem] font-bold tracking-tight text-ink sm:text-4xl sm:leading-tight">
            Find your next <span className="text-brand">Rails role</span>
          </h1>

          <p className="mt-2 max-w-xl text-sm text-ink-muted sm:text-[15px]">
            Curated Ruby on Rails jobs from companies hiring across India.
          </p>

          <form
            onSubmit={(e) => void onSubscribe(e)}
            className="mt-5 flex w-full max-w-xl flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-center sm:rounded-full sm:border sm:border-slate-200 sm:bg-white sm:p-1.5 sm:shadow-card"
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
              placeholder="Email for weekly alerts"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-full border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition duration-200 placeholder:text-ink-soft focus:border-brand focus:ring-2 focus:ring-brand/15 sm:h-10 sm:flex-1 sm:border-0 sm:bg-transparent sm:focus:ring-0"
            />
            <button
              type="submit"
              disabled={subscribeBusy}
              className="btn-primary !h-11 shrink-0 !rounded-full !px-5 !py-0 text-sm sm:!h-10"
            >
              {subscribeBusy ? 'Subscribing…' : 'Get alerts'}
            </button>
          </form>

          {(subscribeMsg || subscribeErr) && (
            <p
              className={`mt-2 text-sm ${subscribeErr ? 'text-brand' : 'text-emerald-700'}`}
              role="status"
            >
              {subscribeErr || subscribeMsg}
            </p>
          )}

          <form
            onSubmit={onSearch}
            className="mt-8 w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-2 shadow-card sm:mt-10 sm:p-2.5"
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
                  className="input-field !rounded-xl !py-2.5"
                  placeholder="Job title, skills, keywords…"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
              </div>
              <div className="lg:w-44">
                <label htmlFor="location" className="sr-only">
                  Location
                </label>
                <input
                  id="location"
                  className="input-field !rounded-xl !py-2.5"
                  placeholder="City or remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="lg:w-40">
                <span className="sr-only">Sort by</span>
                <SelectMenu
                  value={filters.sort_by || 'newest'}
                  options={SORT_OPTIONS}
                  onChange={(next) => setFilters((p) => ({ ...p, sort_by: next, page: 1 }))}
                  triggerClassName="!rounded-xl !py-2.5"
                />
              </div>
              <button type="submit" className="btn-primary shrink-0 !rounded-xl !py-2.5 lg:px-6">
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      <section ref={listRef} className="container-page relative scroll-mt-24 pb-16 pt-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm">
            <span className="font-semibold text-ink">{loading ? '…' : total}</span>
            <span className="text-ink-muted">jobs found</span>
          </div>
          {!loading && totalPages > 1 && (
            <span className="text-sm text-slate-500">
              Page {filters.page || 1} of {totalPages}
            </span>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error}
            <p className="mt-1 text-amber-800/80">
              Start Rails on :3000 so the Vite proxy can reach /api/v1.
            </p>
          </div>
        )}

        {loading ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-xl border border-slate-200 bg-white" />
            ))}
          </div>
        ) : jobs.length === 0 && !error ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <h2 className="text-base font-semibold text-ink">No jobs found</h2>
            <p className="mt-2 text-sm text-ink-muted">Try different keywords or clear filters.</p>
          </div>
        ) : (
          <>
            <ul className="mt-4 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
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

            <Pagination
              page={filters.page || 1}
              totalPages={totalPages}
              totalCount={total}
              perPage={perPage}
              onChange={goToPage}
              label="jobs"
            />
          </>
        )}
      </section>
    </div>
  )
}
