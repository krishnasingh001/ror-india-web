import { FormEvent, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { companyInitial } from '@/lib/format'
import { SelectMenu } from '@/components/SelectMenu'
import type { DeveloperProfile } from '@/types'

type FormState = {
  full_name: string
  phone: string
  current_role: string
  experience: string
  date_of_birth: string
  preferred_locations: string
  linkedin_profile: string
  github_profile: string
  portfolio_website: string
  city: string
  state: string
  country: string
  bio: string
  skills: string
  current_company: string
  current_ctc: string
  expected_ctc: string
  notice_period: string
  job_type: string
  shift_preference: string
  work_experience_details: string
  highest_qualification: string
  university: string
  graduation_year: string
}

const CTC_OPTIONS = [3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 18, 20, 25, 30, 35, 40, 45, 50].map((lpa) => ({
  label: lpa === 50 ? `₹${lpa} LPA+` : `₹${lpa} LPA`,
  value: String(lpa * 100000),
}))

const QUALIFICATION_OPTIONS = [
  'B.E / B.Tech',
  'B.Sc',
  'BCA',
  'M.E / M.Tech',
  'MCA',
  'M.Sc',
  'MBA',
  'Diploma',
  'PhD',
  'Other',
]

const GRADUATION_YEARS = Array.from({ length: 40 }, (_, i) => String(new Date().getFullYear() - i))
const NOTICE_OPTIONS = ['Immediate', '15 days', '1 month', '2 months', '3 months', 'More than 3 months'].map(
  (o) => ({ value: o, label: o }),
)
const JOB_TYPE_OPTIONS = ['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance'].map((o) => ({
  value: o,
  label: o,
}))
const SHIFT_OPTIONS = ['Day', 'Night', 'Rotational', 'Flexible'].map((o) => ({ value: o, label: o }))
const QUALIFICATION_SELECT_OPTIONS = QUALIFICATION_OPTIONS.map((o) => ({ value: o, label: o }))
const GRADUATION_YEAR_OPTIONS = GRADUATION_YEARS.map((y) => ({ value: y, label: y }))
const CTC_SELECT_OPTIONS = [{ value: '', label: 'Select' }, ...CTC_OPTIONS]

function nearestCtcValue(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(Number(amount))) return ''
  const numeric = Number(amount)
  const exact = CTC_OPTIONS.find((o) => Number(o.value) === numeric)
  if (exact) return exact.value
  // Snap legacy/custom amounts to the nearest option
  let best = CTC_OPTIONS[0]
  let bestDiff = Math.abs(Number(best.value) - numeric)
  for (const opt of CTC_OPTIONS) {
    const diff = Math.abs(Number(opt.value) - numeric)
    if (diff < bestDiff) {
      best = opt
      bestDiff = diff
    }
  }
  return best.value
}

const emptyForm: FormState = {
  full_name: '',
  phone: '',
  current_role: '',
  experience: '',
  date_of_birth: '',
  preferred_locations: '',
  linkedin_profile: '',
  github_profile: '',
  portfolio_website: '',
  city: '',
  state: '',
  country: '',
  bio: '',
  skills: '',
  current_company: '',
  current_ctc: '',
  expected_ctc: '',
  notice_period: '',
  job_type: '',
  shift_preference: '',
  work_experience_details: '',
  highest_qualification: '',
  university: '',
  graduation_year: '',
}

function profileToForm(profile: DeveloperProfile): FormState {
  return {
    full_name: profile.full_name || '',
    phone: profile.phone || '',
    current_role: profile.current_role || '',
    experience: profile.experience != null ? String(profile.experience) : '',
    date_of_birth: profile.date_of_birth ? profile.date_of_birth.slice(0, 10) : '',
    preferred_locations: (profile.preferred_locations || []).join(', '),
    linkedin_profile: profile.linkedin_profile || '',
    github_profile: profile.github_profile || '',
    portfolio_website: profile.portfolio_website || '',
    city: profile.city || '',
    state: profile.state || '',
    country: profile.country || '',
    bio: profile.bio || profile.career_summary || '',
    skills: (profile.skills || []).join(', '),
    current_company: profile.current_company || '',
    current_ctc: nearestCtcValue(profile.current_ctc),
    expected_ctc: nearestCtcValue(profile.expected_ctc),
    notice_period: profile.notice_period || '',
    job_type: profile.job_type || '',
    shift_preference: profile.shift_preference || '',
    work_experience_details: (profile.work_experience_details || []).join('\n'),
    highest_qualification: profile.highest_qualification || '',
    university: profile.university || '',
    graduation_year: profile.graduation_year != null ? String(profile.graduation_year) : '',
  }
}

function mergeExtracted(
  prev: FormState,
  extracted: Partial<{
    full_name: string
    phone: string
    linkedin_profile: string
    github_profile: string
    portfolio_website: string
    current_role: string
    experience: number
    skills: string[]
    preferred_locations: string[]
    city: string
    state: string
    country: string
    current_company: string
    bio: string
    work_experience_details: string[]
    date_of_birth: string
  }>,
): FormState {
  const next = { ...prev }
  // Resume upload should prefill from extraction (overwrite empty or replace with parsed values).
  const apply = (key: keyof FormState, value?: string | null) => {
    if (!value?.toString().trim()) return
    next[key] = value
  }

  apply('full_name', extracted.full_name)
  apply('phone', extracted.phone)
  apply('linkedin_profile', extracted.linkedin_profile)
  apply('github_profile', extracted.github_profile)
  apply('portfolio_website', extracted.portfolio_website)
  apply('current_role', extracted.current_role)
  apply('experience', extracted.experience != null ? String(extracted.experience) : undefined)
  apply('city', extracted.city)
  apply('state', extracted.state)
  apply('country', extracted.country)
  apply('current_company', extracted.current_company)
  apply('bio', extracted.bio)
  apply('date_of_birth', extracted.date_of_birth ? extracted.date_of_birth.slice(0, 10) : undefined)

  if (extracted.skills?.length) {
    next.skills = extracted.skills.join(', ')
  }
  if (extracted.preferred_locations?.length) {
    next.preferred_locations = extracted.preferred_locations.join(', ')
  }
  if (extracted.work_experience_details?.length) {
    next.work_experience_details = extracted.work_experience_details.join('\n\n')
  }

  return next
}

export function ProfileEditPage() {
  const { user, refresh } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exists, setExists] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [completion, setCompletion] = useState(0)
  const [resumeName, setResumeName] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [parsing, setParsing] = useState(false)

  useEffect(() => {
    let cancelled = false
    api
      .fetchProfile()
      .then((res) => {
        if (cancelled) return
        setExists(res.exists)
        if (res.data) {
          setForm(profileToForm(res.data))
          setCompletion(res.data.profile_completion || 0)
          setResumeName(res.data.resume?.filename || null)
          setPhotoPreview(res.data.profile_picture_url)
        } else if (user?.name) {
          setForm((prev) => ({ ...prev, full_name: user.name }))
        }
      })
      .catch((e: Error) => setMessage(e.message))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user?.name])

  const avatarLetter = useMemo(() => companyInitial(form.full_name || user?.name || 'U'), [form.full_name, user?.name])

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function onResumeChange(file: File | null) {
    setResumeFile(file)
    if (!file) return

    setResumeName(file.name)
    setParsing(true)
    setMessage(null)
    setErrors((prev) => {
      const next = { ...prev }
      delete next.resume
      return next
    })

    try {
      const res = await api.parseResume(file)
      setForm((prev) => mergeExtracted(prev, res.data || {}))
      setMessage(res.message || 'Details extracted from your resume. Review and save.')
    } catch (err: unknown) {
      const e2 = err as { message?: string; payload?: { message?: string; errors?: Record<string, string[]> } }
      setErrors(e2.payload?.errors || {})
      setMessage(
        e2.payload?.message ||
          e2.message ||
          'Could not extract details from this resume. You can fill the form manually.',
      )
    } finally {
      setParsing(false)
    }
  }

  function onPhotoChange(file: File | null) {
    setPhotoFile(file)
    if (file) setPhotoPreview(URL.createObjectURL(file))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    setMessage(null)

    const body = new FormData()
    const fields: Array<[string, string]> = [
      ['full_name', form.full_name],
      ['phone', form.phone],
      ['current_role', form.current_role],
      ['experience', form.experience],
      ['date_of_birth', form.date_of_birth],
      ['preferred_locations', form.preferred_locations],
      ['linkedin_profile', form.linkedin_profile],
      ['github_profile', form.github_profile],
      ['portfolio_website', form.portfolio_website],
      ['city', form.city],
      ['state', form.state],
      ['country', form.country],
      ['bio', form.bio],
      ['career_summary', form.bio],
      ['skills', form.skills],
      ['current_company', form.current_company],
      ['current_ctc', form.current_ctc],
      ['expected_ctc', form.expected_ctc],
      ['notice_period', form.notice_period],
      ['job_type', form.job_type],
      ['shift_preference', form.shift_preference],
      ['work_experience_details', form.work_experience_details],
      ['highest_qualification', form.highest_qualification],
      ['university', form.university],
      ['graduation_year', form.graduation_year],
    ]

    fields.forEach(([key, value]) => {
      if (value !== '') body.append(`developer_profile[${key}]`, value)
    })

    if (resumeFile) body.append('developer_profile[resume]', resumeFile)
    if (photoFile) body.append('developer_profile[profile_picture]', photoFile)

    try {
      const res = exists ? await api.updateProfile(body) : await api.createProfile(body)
      await refresh()
      setMessage(res.message)
      navigate('/profile')
    } catch (err: unknown) {
      const e2 = err as { message?: string; payload?: { errors?: Record<string, string[]>; message?: string } }
      setErrors(e2.payload?.errors || {})
      setMessage(e2.payload?.message || e2.message || 'Could not save profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container-page py-10">
        <div className="h-64 animate-pulse rounded-2xl bg-white" />
      </div>
    )
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-sm font-bold text-slate-700">
            {photoPreview ? <img src={photoPreview} alt="" className="h-full w-full object-cover" /> : avatarLetter}
          </div>
          <div>
            <p className="text-sm text-slate-500">Developer profile</p>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {exists ? 'Edit profile' : 'Create profile'}
            </h1>
          </div>
        </div>
        <Link to={exists ? '/profile' : '/dashboard'} className="btn-secondary !py-2.5">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </Link>
      </header>

      <div className="dash-panel mt-6 !py-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-600">Profile completion</span>
          <strong className="text-ink">{completion}%</strong>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand" style={{ width: `${completion}%` }} />
        </div>
      </div>

      {message && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {message}
        </div>
      )}

      <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-5">
        <section className="dash-panel">
          <div className="mb-5 flex items-center gap-2">
            <span className="text-brand">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
              </svg>
            </span>
            <h2 className="text-base font-bold text-ink">Documents</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex cursor-pointer flex-col gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4 transition hover:border-brand-border">
              <div className="flex items-start gap-3">
                <span className="text-brand">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
                    <path strokeLinecap="round" d="M14 3v5h5" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">
                    Resume <span className="text-brand">*</span>
                  </p>
                  <p className="text-xs text-slate-500">PDF or DOCX, max 5MB — we’ll autofill your profile</p>
                </div>
              </div>
              {resumeName && (
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  ✓ {resumeName}
                </span>
              )}
              {parsing && (
                <span className="text-xs font-medium text-slate-500">Extracting details from resume…</span>
              )}
              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="sr-only"
                disabled={parsing || saving}
                onChange={(e) => void onResumeChange(e.target.files?.[0] || null)}
              />
              {errors.resume && <p className="text-xs text-brand">{errors.resume.join(', ')}</p>}
            </label>

            <label className="flex cursor-pointer flex-col gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4 transition hover:border-brand-border">
              <div className="flex items-start gap-3">
                <span className="text-brand">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" d="M4 7h3l2-2h6l2 2h3v12H4V7Z" />
                    <circle cx="12" cy="13" r="3.5" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">Profile photo</p>
                  <p className="text-xs text-slate-500">Optional, max 2MB</p>
                </div>
              </div>
              {photoPreview && (
                <img src={photoPreview} alt="" className="h-14 w-14 rounded-full object-cover ring-2 ring-white" />
              )}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => onPhotoChange(e.target.files?.[0] || null)}
              />
              {errors.profile_picture && (
                <p className="text-xs text-brand">{errors.profile_picture.join(', ')}</p>
              )}
            </label>
          </div>
        </section>

        <section className="dash-panel">
          <div className="mb-5 flex items-center gap-2">
            <span className="text-brand">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" d="M20 21a8 8 0 0 0-16 0" />
                <circle cx="12" cy="8" r="4" />
              </svg>
            </span>
            <h2 className="text-base font-bold text-ink">Personal &amp; professional</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required error={errors.full_name}>
              <input className="input-field" value={form.full_name} onChange={(e) => setField('full_name', e.target.value)} required />
            </Field>
            <Field label="Email" hint="Linked to your account">
              <input className="input-field bg-slate-50" value={user?.email || ''} readOnly />
            </Field>
            <Field label="Phone" required error={errors.phone}>
              <input className="input-field" value={form.phone} onChange={(e) => setField('phone', e.target.value)} required />
            </Field>
            <Field label="Current role" required error={errors.current_role}>
              <input className="input-field" value={form.current_role} onChange={(e) => setField('current_role', e.target.value)} required />
            </Field>
            <Field label="Experience (years)" required error={errors.experience}>
              <input
                className="input-field"
                type="number"
                min={0}
                max={50}
                value={form.experience}
                onChange={(e) => setField('experience', e.target.value)}
                required
              />
            </Field>
            <Field label="Date of birth" required error={errors.date_of_birth}>
              <input
                className="input-field"
                type="date"
                value={form.date_of_birth}
                onChange={(e) => setField('date_of_birth', e.target.value)}
                required
              />
            </Field>
            <Field label="Preferred locations" hint="Comma-separated" error={errors.preferred_locations}>
              <input
                className="input-field"
                value={form.preferred_locations}
                onChange={(e) => setField('preferred_locations', e.target.value)}
                placeholder="Mumbai, Bangalore, Remote"
              />
            </Field>
            <Field label="LinkedIn" error={errors.linkedin_profile}>
              <input
                className="input-field"
                value={form.linkedin_profile}
                onChange={(e) => setField('linkedin_profile', e.target.value)}
                placeholder="https://www.linkedin.com/in/username"
              />
            </Field>
            <Field label="GitHub" error={errors.github_profile}>
              <input
                className="input-field"
                value={form.github_profile}
                onChange={(e) => setField('github_profile', e.target.value)}
                placeholder="https://github.com/username"
              />
            </Field>
            <Field label="Portfolio" error={errors.portfolio_website}>
              <input
                className="input-field"
                value={form.portfolio_website}
                onChange={(e) => setField('portfolio_website', e.target.value)}
                placeholder="https://yoursite.me"
              />
            </Field>
            <Field label="City" error={errors.city}>
              <input className="input-field" value={form.city} onChange={(e) => setField('city', e.target.value)} />
            </Field>
            <Field label="State" error={errors.state}>
              <input className="input-field" value={form.state} onChange={(e) => setField('state', e.target.value)} />
            </Field>
            <Field label="Country" error={errors.country}>
              <input className="input-field" value={form.country} onChange={(e) => setField('country', e.target.value)} />
            </Field>
            <Field label="Current company" error={errors.current_company}>
              <input className="input-field" value={form.current_company} onChange={(e) => setField('current_company', e.target.value)} />
            </Field>
            <Field label="Current CTC" error={errors.current_ctc}>
              <SelectMenu
                value={form.current_ctc}
                options={CTC_SELECT_OPTIONS}
                placeholder="Select"
                onChange={(next) => setField('current_ctc', next)}
              />
            </Field>
            <Field label="Expected CTC" error={errors.expected_ctc}>
              <SelectMenu
                value={form.expected_ctc}
                options={CTC_SELECT_OPTIONS}
                placeholder="Select"
                onChange={(next) => setField('expected_ctc', next)}
              />
            </Field>
            <Field label="Notice period" error={errors.notice_period}>
              <SelectMenu
                value={form.notice_period}
                options={[{ value: '', label: 'Select' }, ...NOTICE_OPTIONS]}
                placeholder="Select"
                onChange={(next) => setField('notice_period', next)}
              />
            </Field>
            <Field label="Job type preference" error={errors.job_type}>
              <SelectMenu
                value={form.job_type}
                options={[{ value: '', label: 'Select' }, ...JOB_TYPE_OPTIONS]}
                placeholder="Select"
                onChange={(next) => setField('job_type', next)}
              />
            </Field>
            <Field label="Shift preference" error={errors.shift_preference}>
              <SelectMenu
                value={form.shift_preference}
                options={[{ value: '', label: 'Select' }, ...SHIFT_OPTIONS]}
                placeholder="Select"
                onChange={(next) => setField('shift_preference', next)}
              />
            </Field>
            <Field label="Highest qualification" error={errors.highest_qualification}>
              <SelectMenu
                value={form.highest_qualification}
                options={[{ value: '', label: 'Select' }, ...QUALIFICATION_SELECT_OPTIONS]}
                placeholder="Select"
                onChange={(next) => setField('highest_qualification', next)}
              />
            </Field>
            <Field label="University / College" error={errors.university}>
              <input
                className="input-field"
                value={form.university}
                onChange={(e) => setField('university', e.target.value)}
                placeholder="University of Mumbai"
              />
            </Field>
            <Field label="Graduation year" error={errors.graduation_year}>
              <SelectMenu
                value={form.graduation_year}
                options={[{ value: '', label: 'Select' }, ...GRADUATION_YEAR_OPTIONS]}
                placeholder="Select"
                onChange={(next) => setField('graduation_year', next)}
              />
            </Field>
            <Field label="Skills" hint="Comma-separated" error={errors.skills}>
              <input
                className="input-field"
                value={form.skills}
                onChange={(e) => setField('skills', e.target.value)}
                placeholder="Ruby, Rails, PostgreSQL"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Professional summary" error={errors.bio}>
                <textarea
                  className="input-field min-h-[120px]"
                  value={form.bio}
                  onChange={(e) => setField('bio', e.target.value)}
                  placeholder="Brief summary of your experience…"
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Work experience" hint="One bullet per line" error={errors.work_experience_details}>
                <textarea
                  className="input-field min-h-[140px]"
                  value={form.work_experience_details}
                  onChange={(e) => setField('work_experience_details', e.target.value)}
                  placeholder={'Senior Software Engineer at Acme (2022–Present)\nBuilt Rails APIs…'}
                />
              </Field>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Link to={exists ? '/profile' : '/dashboard'} className="btn-secondary">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  error?: string[]
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="label-field">
        {label}
        {required && <span className="text-brand"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-brand">{error.join(', ')}</span>}
    </label>
  )
}
