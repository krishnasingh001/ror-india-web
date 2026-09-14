import { FormEvent, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CompanyCard } from '@/components/CompanyCard'
import { Pagination } from '@/components/Pagination'
import { useIsRecruiter } from '@/context/AuthContext'
import { api } from '@/lib/api'
import type { Company } from '@/types'

export function CompaniesPage() {
  const isRecruiter = useIsRecruiter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [perPage, setPerPage] = useState(12)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const listRef = useRef<HTMLElement>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    api
      .fetchCompanies({ search: query || undefined, page })
      .then((res) => {
        if (!cancelled) {
          setCompanies(res.data)
          setTotal(res.meta.total_count)
          setTotalPages(res.meta.total_pages)
          setPerPage(res.meta.per_page)
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message)
          setCompanies([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [query, page])

  function onSearch(e: FormEvent) {
    e.preventDefault()
    setPage(1)
    setQuery(search.trim())
  }

  function goToPage(next: number) {
    setPage(next)
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div>
      <section className="hero-surface">
        <div className="container-page py-10 sm:py-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
                {isRecruiter ? 'Hiring' : 'Companies hiring Rails'}
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {isRecruiter ? (
                  <>
                    Manage <span className="text-brand">companies</span>
                  </>
                ) : (
                  <>
                    Explore top <span className="text-brand">Rails companies</span>
                  </>
                )}
              </h1>
              <p className="mt-3 max-w-xl text-sm text-ink-muted sm:text-base">
                {isRecruiter
                  ? 'Add your company, then attach it when you post Rails roles.'
                  : 'Discover teams, follow the ones you care about, and jump into open roles.'}
              </p>
            </div>
            {isRecruiter && (
              <Link to="/companies/new" className="btn-primary cursor-pointer shrink-0">
                Add company
              </Link>
            )}
          </div>

          <form
            onSubmit={onSearch}
            className="mt-8 flex flex-col gap-2 rounded-xl border border-slate-300 bg-white p-3 shadow-sm sm:flex-row sm:p-4"
            role="search"
            aria-label="Search companies"
          >
            <label htmlFor="co-search" className="sr-only">
              Search companies
            </label>
            <input
              id="co-search"
              className="input-field"
              placeholder="Search companies by name or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn-primary shrink-0 cursor-pointer sm:px-6">
              Search
            </button>
          </form>
        </div>
      </section>

      <section ref={listRef} className="container-page scroll-mt-24 py-8 pb-16">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm">
            <span className="font-semibold text-ink">{loading ? '…' : total}</span>
            <span className="text-ink-muted">
              {total === 1 ? 'company' : 'companies'} found
            </span>
          </div>
          {!loading && totalPages > 1 && (
            <span className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </span>
          )}
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl border border-slate-300 bg-white" />
            ))}
          </div>
        ) : companies.length === 0 && !error ? (
          <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <h2 className="text-base font-semibold text-ink">No companies found</h2>
            <p className="mt-2 text-sm text-ink-muted">Try a different search.</p>
          </div>
        ) : (
          <>
            <ul className="mt-6 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {companies.map((c) => (
                <li key={c.id}>
                  <CompanyCard
                    company={c}
                    onChange={(next) =>
                      setCompanies((prev) => prev.map((x) => (x.id === next.id ? next : x)))
                    }
                  />
                </li>
              ))}
            </ul>

            <Pagination
              page={page}
              totalPages={totalPages}
              totalCount={total}
              perPage={perPage}
              onChange={goToPage}
              label="companies"
            />
          </>
        )}
      </section>
    </div>
  )
}
