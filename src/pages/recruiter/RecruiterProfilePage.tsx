import { FormEvent, useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import type { RecruiterProfile } from '@/types'

type FormState = {
  full_name: string
  job_title: string
  phone: string
  company_name: string
  location: string
  linkedin_url: string
  website: string
  bio: string
}

const emptyForm: FormState = {
  full_name: '',
  job_title: '',
  phone: '',
  company_name: '',
  location: '',
  linkedin_url: '',
  website: '',
  bio: '',
}

function toForm(data: RecruiterProfile, fallbackName = ''): FormState {
  return {
    full_name: data.full_name || fallbackName || '',
    job_title: data.job_title || '',
    phone: data.phone || '',
    company_name: data.company_name || '',
    location: data.location || '',
    linkedin_url: data.linkedin_url || '',
    website: data.website || '',
    bio: data.bio || '',
  }
}

export function RecruiterProfilePage() {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api
      .fetchRecruiterAccount()
      .then((res) => {
        if (cancelled) return
        setForm(toForm(res.data, user?.name || ''))
        setPhotoPreview(res.data.profile_picture_url || res.data.avatar_url || user?.avatar || null)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load profile')
          setForm({ ...emptyForm, full_name: user?.name || '' })
          setPhotoPreview(user?.avatar || null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user?.name, user?.avatar])

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    setError(null)
    setFieldErrors({})

    const body = new FormData()
    ;(Object.keys(form) as (keyof FormState)[]).forEach((key) => {
      body.append(`recruiter_profile[${key}]`, form[key])
    })
    if (photoFile) body.append('recruiter_profile[profile_picture]', photoFile)

    try {
      const res = await api.updateRecruiterAccount(body)
      setForm(toForm(res.data, user?.name || ''))
      setPhotoPreview(res.data.profile_picture_url || res.data.avatar_url || null)
      setPhotoFile(null)
      if (res.user) setUser(res.user)
      setMessage(res.message || 'Profile saved.')
    } catch (err) {
      const payload = err as Error & { payload?: { message?: string; errors?: Record<string, string[]> } }
      setFieldErrors(payload.payload?.errors || {})
      setError(payload.payload?.message || (err instanceof Error ? err.message : 'Could not save profile'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="container-page py-16 text-ink-muted">Loading profile…</div>
  }

  const initial = (form.full_name || user?.name || 'R').trim().charAt(0).toUpperCase()

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Hiring</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">Your recruiter profile</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Update how you appear when posting jobs and reviewing talent.
          </p>
        </div>
        <Link to="/dashboard" className="btn-secondary cursor-pointer !py-2">
          Back to dashboard
        </Link>
      </div>

      <form
        onSubmit={onSubmit}
        className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-panel sm:p-8"
      >
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
            {message}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-brand-soft text-2xl font-bold text-brand">
            {photoPreview ? (
              <img src={photoPreview} alt="" className="h-full w-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <div>
            <label htmlFor="recruiter-photo" className="text-sm font-semibold text-ink">
              Profile photo
            </label>
            <input
              id="recruiter-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="mt-1.5 block w-full text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-ink hover:file:bg-slate-200"
              onChange={(e) => {
                const file = e.target.files?.[0] || null
                setPhotoFile(file)
                if (file) setPhotoPreview(URL.createObjectURL(file))
              }}
            />
            {fieldErrors.profile_picture && (
              <p className="mt-1 text-xs text-brand">{fieldErrors.profile_picture.join(', ')}</p>
            )}
            <p className="mt-1 text-xs text-slate-500">JPEG, PNG, WebP or GIF · max 5MB</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" required error={fieldErrors.full_name}>
            <input
              className="input-field mt-1.5"
              required
              value={form.full_name}
              onChange={(e) => setField('full_name', e.target.value)}
              placeholder="Your name"
            />
          </Field>
          <Field label="Email">
            <input
              className="input-field mt-1.5 bg-slate-50 text-slate-600"
              value={user?.email || ''}
              disabled
              readOnly
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Job title" error={fieldErrors.job_title}>
            <input
              className="input-field mt-1.5"
              value={form.job_title}
              onChange={(e) => setField('job_title', e.target.value)}
              placeholder="Talent Partner / Engineering Recruiter"
            />
          </Field>
          <Field label="Phone" error={fieldErrors.phone}>
            <input
              className="input-field mt-1.5"
              value={form.phone}
              onChange={(e) => setField('phone', e.target.value)}
              placeholder="+91 98765 43210"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company" error={fieldErrors.company_name}>
            <input
              className="input-field mt-1.5"
              value={form.company_name}
              onChange={(e) => setField('company_name', e.target.value)}
              placeholder="Where you hire for"
            />
          </Field>
          <Field label="Location" error={fieldErrors.location}>
            <input
              className="input-field mt-1.5"
              value={form.location}
              onChange={(e) => setField('location', e.target.value)}
              placeholder="Bangalore / Remote"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="LinkedIn" error={fieldErrors.linkedin_url}>
            <input
              type="url"
              className="input-field mt-1.5"
              value={form.linkedin_url}
              onChange={(e) => setField('linkedin_url', e.target.value)}
              placeholder="https://linkedin.com/in/you"
            />
          </Field>
          <Field label="Website" error={fieldErrors.website}>
            <input
              type="url"
              className="input-field mt-1.5"
              value={form.website}
              onChange={(e) => setField('website', e.target.value)}
              placeholder="https://company.com"
            />
          </Field>
        </div>

        <Field label="About" error={fieldErrors.bio}>
          <textarea
            className="input-field mt-1.5 min-h-[120px]"
            value={form.bio}
            onChange={(e) => setField('bio', e.target.value)}
            placeholder="A short intro about the roles you hire for and how candidates can reach you."
          />
        </Field>

        <div className="flex flex-wrap gap-3 pt-1">
          <button type="submit" disabled={saving} className="btn-primary cursor-pointer">
            {saving ? 'Saving…' : 'Save profile'}
          </button>
          <Link to="/companies/new" className="btn-secondary cursor-pointer">
            Add a company
          </Link>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string[]
  children: ReactNode
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-ink">
        {label}
        {required && <span className="text-brand"> *</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-brand">{error.join(', ')}</p>}
    </div>
  )
}
