import { FormEvent, useEffect, useState } from 'react'
import { CompanyCard } from '@/components/CompanyCard'
import { fetchCompanies } from '@/lib/api'
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
    setError(null)

    fetchCompanies({ search: query || undefined, page: 1 })
      .then((res) => {
        if (cancelled) return
        setCompanies(res.data)
        setTotal(res.meta.total_count)
      })
      .catch((err: Error) => {
        if (cancelled) return
        setError(err.message || 'Failed to load companies')
        setCompanies([])
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
      <section className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-br from-white via-brand-soft/40 to-slate-100">
        <div className="container-page relative py-14 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
            Ruby on Rails companies
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Explore top <span className="text-brand">Rails companies</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-ink-muted sm:text-lg">
            Discover teams hiring Ruby on Rails developers across India.
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
              placeholder="Search companies by name or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search companies"
            />
            <button
              type="submit"
              className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-hover"
            >
              Search
            </button>
          </div>
        </form>

        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm shadow-sm">
          <span className="font-semibold text-ink">{loading ? '…' : total}</span>
          <span className="text-ink-muted">
            {total === 1 ? 'company' : 'companies'} found
          </span>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl border border-gray-200 bg-white" />
            ))}
          </div>
        ) : companies.length === 0 && !error ? (
          <div className="mt-10 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-ink">No companies found</h2>
            <p className="mt-2 text-sm text-ink-muted">Try adjusting your search.</p>
          </div>
        ) : (
          <ul className="mt-6 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {companies.map((company) => (
              <li key={company.id} className="min-w-0">
                <CompanyCard company={company} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
