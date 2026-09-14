import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'

export function CompanyFormPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [website, setWebsite] = useState('')
  const [headquarter, setHeadquarter] = useState('')
  const [companyType, setCompanyType] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    setError(null)
    try {
      const res = await api.createCompany({
        name: name.trim(),
        website: website.trim() || undefined,
        headquarter: headquarter.trim() || undefined,
        company_type: companyType.trim() || undefined,
      })
      navigate(`/companies/${res.data.id}`)
    } catch (err) {
      const payload = err as Error & { payload?: { errors?: string[] } }
      setError(
        payload.payload?.errors?.join(', ') ||
          (err instanceof Error ? err.message : 'Could not create company'),
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Hiring</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">Add a company</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Create a company profile to attach when you post jobs.
          </p>
        </div>
        <Link to="/companies" className="btn-secondary cursor-pointer !py-2">
          Browse companies
        </Link>
      </div>

      <form
        onSubmit={onSubmit}
        className="mx-auto max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-panel sm:p-8"
      >
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="company-name" className="text-sm font-semibold text-ink">
            Company name <span className="text-brand">*</span>
          </label>
          <input
            id="company-name"
            className="input-field mt-1.5"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Acme Rails Labs"
          />
        </div>

        <div>
          <label htmlFor="company-website" className="text-sm font-semibold text-ink">
            Website
          </label>
          <input
            id="company-website"
            type="url"
            className="input-field mt-1.5"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="company-hq" className="text-sm font-semibold text-ink">
              Headquarters
            </label>
            <input
              id="company-hq"
              className="input-field mt-1.5"
              value={headquarter}
              onChange={(e) => setHeadquarter(e.target.value)}
              placeholder="Bangalore / Remote"
            />
          </div>
          <div>
            <label htmlFor="company-type" className="text-sm font-semibold text-ink">
              Industry / type
            </label>
            <input
              id="company-type"
              className="input-field mt-1.5"
              value={companyType}
              onChange={(e) => setCompanyType(e.target.value)}
              placeholder="SaaS / Product"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" disabled={busy} className="btn-primary cursor-pointer">
            {busy ? 'Creating…' : 'Create company'}
          </button>
          <Link to="/jobs/new" className="btn-secondary cursor-pointer">
            Post a job instead
          </Link>
        </div>
      </form>
    </div>
  )
}
