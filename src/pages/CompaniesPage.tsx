import { FormEvent, useEffect, useState } from 'react'
import { CompanyCard } from '@/components/CompanyCard'
import { api } from '@/lib/api'
import type { Company } from '@/types'

export function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api
      .fetchCompanies({ search: query || undefined, page: 1 })
      .then((res) => {
        if (!cancelled) {
          setCompanies(res.data)
          setTotal(res.meta.total_count)
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
  }, [query])

  function onSearch(e: FormEvent) {
    e.preventDefault()
    setQuery(search.trim())
  }

  return (
    <div>
      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#fff_0%,#FEF2F2_40%,#F8FAFC_100%)]">
        <div className="container-page py-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            Companies hiring Rails
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Explore top <span className="text-brand">Rails companies</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-ink-muted sm:text-base">
            Discover teams, follow the ones you care about, and jump into open roles.
          </p>

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
            <button type="submit" className="btn-primary shrink-0 sm:px-6">
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="container-page py-8 pb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm">
          <span className="font-semibold text-ink">{loading ? '…' : total}</span>
          <span className="text-ink-muted">
            {total === 1 ? 'company' : 'companies'} found
          </span>
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
        ) : (
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
        )}
      </section>
    </div>
  )
}
