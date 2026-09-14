import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { SelectMenu } from '@/components/SelectMenu'
import { api } from '@/lib/api'
import type { Company, JobFormInput, JobTypeOption } from '@/types'

const EXPERIENCE_OPTIONS = [
  { value: 'Entry Level', label: 'Entry Level' },
  { value: 'Junior', label: 'Junior' },
  { value: 'Mid-Level', label: 'Mid-Level' },
  { value: 'Senior', label: 'Senior' },
  { value: 'Lead', label: 'Lead' },
  { value: 'Principal', label: 'Principal' },
]

const emptyForm: JobFormInput = {
  title: '',
  description: '',
  job_type_id: '',
  location: '',
  min_salary: '',
  max_salary: '',
  experience_level: 'Mid-Level',
  application_deadline: '',
  email: '',
  company_id: '',
  active: true,
  skills_required: '',
}

export function JobFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState<JobFormInput>(emptyForm)
  const [jobTypes, setJobTypes] = useState<JobTypeOption[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [error, setError] = useState<string | null>(null)
  const [showNewCompany, setShowNewCompany] = useState(false)
  const [newCompany, setNewCompany] = useState({ name: '', website: '', headquarter: '' })
  const [creatingCompany, setCreatingCompany] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([api.fetchJobTypes(), api.fetchCompanies({ per_page: 100 })])
      .then(([typesRes, cosRes]) => {
        if (cancelled) return
        setJobTypes(typesRes.data)
        setCompanies(cosRes.data)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    api
      .fetchJob(id)
      .then((res) => {
        if (cancelled) return
        const job = res.data
        setForm({
          title: job.title || '',
          description: job.description || job.description_html?.replace(/<[^>]+>/g, '') || '',
          job_type_id: job.job_type_id ?? '',
          location: job.location || '',
          min_salary: job.min_salary ?? '',
          max_salary: job.max_salary ?? '',
          experience_level: job.experience_level || 'Mid-Level',
          application_deadline: job.application_deadline?.slice(0, 10) || '',
          email: job.email || '',
          company_id: job.company_id ?? job.company?.id ?? '',
          active: job.active !== false,
          skills_required: (job.skills || []).join(', '),
        })
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load job'))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  function setField<K extends keyof JobFormInput>(key: K, value: JobFormInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function onCreateCompany(e: FormEvent) {
    e.preventDefault()
    if (!newCompany.name.trim()) return
    setCreatingCompany(true)
    setError(null)
    try {
      const res = await api.createCompany({
        name: newCompany.name.trim(),
        website: newCompany.website.trim() || undefined,
        headquarter: newCompany.headquarter.trim() || undefined,
      })
      setCompanies((prev) => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)))
      setField('company_id', res.data.id)
      setShowNewCompany(false)
      setNewCompany({ name: '', website: '', headquarter: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create company')
    } finally {
      setCreatingCompany(false)
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const payload: JobFormInput = {
      ...form,
      company_id: form.company_id || null,
      job_type_id: form.job_type_id || null,
      min_salary: form.min_salary === '' ? null : form.min_salary,
      max_salary: form.max_salary === '' ? null : form.max_salary,
      application_deadline: form.application_deadline || null,
    }
    try {
      const res = isEdit && id ? await api.updateJob(id, payload) : await api.createJob(payload)
      navigate(`/jobs/${res.data.id}`)
    } catch (err) {
      const payloadErr = err as Error & { payload?: { errors?: string[] } }
      setError(
        payloadErr.payload?.errors?.join(', ') ||
          (err instanceof Error ? err.message : 'Could not save job'),
      )
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto h-64 max-w-2xl animate-pulse rounded-2xl bg-white shadow-card" />
      </div>
    )
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Hiring</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">
            {isEdit ? 'Edit job' : 'Post a job'}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">Reach Rails developers looking for their next role.</p>
        </div>
        <Link to="/my-jobs" className="btn-secondary cursor-pointer !py-2">
          My jobs
        </Link>
      </div>

      <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-panel sm:p-8">
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <Field label="Job title" required>
          <input
            className="input-field"
            required
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            placeholder="Senior Ruby on Rails Engineer"
          />
        </Field>

        <Field label="Description" required>
          <textarea
            className="input-field min-h-[160px] resize-y"
            required
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            placeholder="Role overview, responsibilities, and stack…"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Location">
            <input
              className="input-field"
              value={form.location || ''}
              onChange={(e) => setField('location', e.target.value)}
              placeholder="Remote / Bangalore"
            />
          </Field>
          <Field label="Experience level">
            <SelectMenu
              value={form.experience_level || 'Mid-Level'}
              onChange={(v) => setField('experience_level', v)}
              options={EXPERIENCE_OPTIONS}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Job type">
            <SelectMenu
              value={form.job_type_id != null ? String(form.job_type_id) : ''}
              onChange={(v) => setField('job_type_id', v)}
              options={[
                { value: '', label: 'Select type' },
                ...jobTypes.map((t) => ({ value: String(t.id), label: t.name })),
              ]}
              placeholder="Select type"
            />
          </Field>
          <Field label="Application email">
            <input
              type="email"
              className="input-field"
              value={form.email || ''}
              onChange={(e) => setField('email', e.target.value)}
              placeholder="hiring@company.com"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Min salary (₹)">
            <input
              type="number"
              className="input-field"
              value={form.min_salary ?? ''}
              onChange={(e) => setField('min_salary', e.target.value)}
            />
          </Field>
          <Field label="Max salary (₹)">
            <input
              type="number"
              className="input-field"
              value={form.max_salary ?? ''}
              onChange={(e) => setField('max_salary', e.target.value)}
            />
          </Field>
          <Field label="Deadline">
            <input
              type="date"
              className="input-field cursor-pointer"
              value={form.application_deadline || ''}
              onChange={(e) => setField('application_deadline', e.target.value)}
            />
          </Field>
        </div>

        <Field label="Skills (comma-separated)">
          <input
            className="input-field"
            value={form.skills_required || ''}
            onChange={(e) => setField('skills_required', e.target.value)}
            placeholder="Ruby, Rails, PostgreSQL, Hotwire"
          />
        </Field>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-sm font-semibold text-ink">Company</label>
            <button
              type="button"
              className="cursor-pointer text-sm font-semibold text-brand hover:text-brand-hover"
              onClick={() => setShowNewCompany((v) => !v)}
            >
              {showNewCompany ? 'Cancel' : '+ Add company'}
            </button>
          </div>
          <SelectMenu
            className="mt-1.5"
            value={form.company_id != null ? String(form.company_id) : ''}
            onChange={(v) => setField('company_id', v)}
            options={[
              { value: '', label: 'No company / select later' },
              ...companies.map((c) => ({ value: String(c.id), label: c.name })),
            ]}
            placeholder="No company / select later"
          />

          {showNewCompany && (
            <div className="mt-3 space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm font-semibold text-ink">New company</p>
              <input
                className="input-field"
                placeholder="Company name"
                required
                value={newCompany.name}
                onChange={(e) => setNewCompany((p) => ({ ...p, name: e.target.value }))}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className="input-field"
                  placeholder="Website"
                  value={newCompany.website}
                  onChange={(e) => setNewCompany((p) => ({ ...p, website: e.target.value }))}
                />
                <input
                  className="input-field"
                  placeholder="HQ / location"
                  value={newCompany.headquarter}
                  onChange={(e) => setNewCompany((p) => ({ ...p, headquarter: e.target.value }))}
                />
              </div>
              <button
                type="button"
                disabled={creatingCompany}
                className="btn-secondary cursor-pointer !py-2"
                onClick={(e) => void onCreateCompany(e)}
              >
                {creatingCompany ? 'Creating…' : 'Create company'}
              </button>
            </div>
          )}
        </div>

        {isEdit && (
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
              checked={form.active !== false}
              onChange={(e) => setField('active', e.target.checked)}
            />
            Job is active / visible
          </label>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" disabled={busy} className="btn-primary cursor-pointer">
            {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Publish job'}
          </button>
          <Link to="/my-jobs" className="btn-secondary cursor-pointer">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-ink">
        {label}
        {required && <span className="text-brand"> *</span>}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}
