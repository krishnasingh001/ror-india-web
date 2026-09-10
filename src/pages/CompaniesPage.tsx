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
    api.fetchCompanies({ search: query || undefined, page: 1 })
      .then((res) => { if (!cancelled) { setCompanies(res.data); setTotal(res.meta.total_count) } })
      .catch((err: Error) => { if (!cancelled) { setError(err.message); setCompanies([]) } })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [query])

  function onSearch(e: FormEvent) {
    e.preventDefault()
    setQuery(search.trim())
  }

  return (
    <div>
      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#fff_0%,#FEF2F2_50%,#F8FAFC_100%)]">
        <div className="container-page py-14 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">Companies hiring Rails</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">Explore top <span className="text-brand">Rails companies</span></h1>
          <p className="mt-4 max-w-xl text-ink-muted">Discover teams, follow the ones you care about, and jump into open roles.</p>
        </div>
      </section>
      <section className="container-page -mt-6 pb-16">
        <form onSubmit={onSearch} className="card-surface flex flex-col gap-3 p-4 shadow-panel sm:flex-row sm:p-5">
          <label htmlFor="co-search" className="sr-only">Search companies</label>
          <input id="co-search" className="input-field" placeholder="Search companies by name or location…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="submit" className="btn-primary">Search</button>
        </form>
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm">
          <span className="font-semibold text-ink">{loading ? '…' : total}</span>
          <span className="text-ink-muted">{total === 1 ? 'company' : 'companies'} found</span>
        </div>
        {error && <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</div>}
        {loading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}
          </div>
        ) : (
          <ul className="mt-6 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {companies.map((c) => (
              <li key={c.id}><CompanyCard company={c} onChange={(next) => setCompanies((prev) => prev.map((x) => (x.id === next.id ? next : x)))} /></li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
