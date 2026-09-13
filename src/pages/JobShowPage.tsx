import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { JobCard } from '@/components/JobCard'
import { api } from '@/lib/api'
import { companyAvatarTone, companyInitial } from '@/lib/format'
import { useAuth } from '@/context/AuthContext'
import type { Job } from '@/types'

export function JobShowPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [similar, setSimilar] = useState<Job[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    api
      .fetchJob(id)
      .then((res) => {
        setJob(res.data)
        setSimilar(res.similar_jobs || [])
      })
      .catch((err: Error) => {
        setError(err.message)
        setJob(null)
        setSimilar([])
      })
      .finally(() => setLoading(false))
  }, [id])

  async function onSave() {
    if (!job) return
    if (!user) return navigate('/sign-in', { state: { from: `/jobs/${job.id}` } })
    setBusy(true)
    try {
      const res = job.saved ? await api.unsaveJob(job.id) : await api.saveJob(job.id)
      setJob({ ...job, saved: res.saved })
    } finally {
      setBusy(false)
    }
  }

  async function onApply() {
    if (!job) return
    if (!user) return navigate('/sign-in', { state: { from: `/jobs/${job.id}` } })

    if (job.external_apply && job.job_url) {
      setBusy(true)
      try {
        await api.trackExternalJob(job.id)
        setJob({ ...job, applied: true })
        window.open(job.job_url, '_blank', 'noopener,noreferrer')
      } catch (e: unknown) {
        const err = e as { message?: string }
        alert(err.message || 'Could not track this application.')
      } finally {
        setBusy(false)
      }
      return
    }

    setBusy(true)
    try {
      await api.applyToJob(job.id)
      setJob({ ...job, applied: true })
    } catch (e: unknown) {
      const err = e as { payload?: { redirect?: string }; message?: string }
      if (err.payload?.redirect) navigate(err.payload.redirect)
      else alert(err.message || 'Could not apply')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="container-page py-10 sm:py-14">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-100" />
        <div className="mt-8 h-72 animate-pulse rounded-2xl bg-white" />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="container-page py-16">
        <p className="text-ink-muted">{error || 'Job not found'}</p>
        <Link to="/" className="mt-4 inline-block font-semibold text-brand">
          Back to jobs
        </Link>
      </div>
    )
  }

  const companyName = job.company?.name || 'Company'
  const tone = companyAvatarTone(companyName)
  const website = job.company?.website
  const skills = job.skills || []

  const facts: Array<{ label: string; value: string }> = [
    { label: 'Location', value: job.location || job.location_short || '—' },
    ...(job.seniority || job.experience_label
      ? [{ label: 'Seniority', value: job.seniority || job.experience_label || '' }]
      : []),
    { label: 'Type', value: job.job_type || 'Full time' },
    ...(job.salary_label ? [{ label: 'Salary', value: job.salary_label }] : []),
    {
      label: 'Posted',
      value: job.posted_label || job.posted_on,
    },
  ]

  return (
    <div className="container-page py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link to="/" className="hover:text-brand">
              Home
            </Link>
          </li>
          <li aria-hidden="true" className="text-slate-300">
            /
          </li>
          <li>
            <Link to="/" className="hover:text-brand">
              Jobs
            </Link>
          </li>
          <li aria-hidden="true" className="text-slate-300">
            /
          </li>
          <li className="max-w-[16rem] truncate text-slate-700 sm:max-w-md">{job.title}</li>
        </ol>
      </nav>

      <article className="mt-8 max-w-3xl">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 ${tone.bg} ${tone.text}`}
          >
            {job.company?.logo_url ? (
              <img src={job.company.logo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xl font-bold">{companyInitial(companyName)}</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{job.title}</h1>
            <p className="mt-2 text-sm text-slate-600">
              {job.company ? (
                <Link to={`/companies/${job.company.id}`} className="font-semibold text-ink hover:text-brand">
                  {companyName}
                </Link>
              ) : (
                <span className="font-semibold text-ink">{companyName}</span>
              )}
              {website && (
                <>
                  <span className="mx-2 text-slate-300">·</span>
                  <a
                    href={website.startsWith('http') ? website : `https://${website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand hover:underline"
                  >
                    Website
                  </a>
                </>
              )}
            </p>
          </div>
        </div>

        <dl className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
          {facts.map((fact) => (
            <div key={fact.label} className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{fact.label}</dt>
              <dd className="mt-1 break-words font-medium text-ink">{fact.value}</dd>
            </div>
          ))}
        </dl>

        {skills.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold text-slate-500">Skills</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <li key={skill} className="pill bg-brand-soft text-brand">
                  {skill}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy || Boolean(job.applied)}
            onClick={() => void onApply()}
            className="btn-primary"
          >
            {job.applied ? 'Applied' : job.external_apply ? 'Apply' : 'Apply now'}
          </button>
          <button type="button" disabled={busy} onClick={() => void onSave()} className="btn-secondary">
            {job.saved ? 'Saved' : 'Save job'}
          </button>
        </div>

        <section className="mt-12 border-t border-slate-200 pt-10">
          <h2 className="text-lg font-bold tracking-tight text-ink">About the role</h2>
          {job.description_html ? (
            <div
              className="job-desc-html mt-5"
              dangerouslySetInnerHTML={{ __html: job.description_html }}
            />
          ) : (
            <p className="mt-5 text-sm text-slate-600">
              No full description is available for this listing yet.
              {job.external_apply && job.job_url && (
                <>
                  {' '}
                  <a
                    href={job.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-brand hover:underline"
                  >
                    View on the company site
                  </a>
                  .
                </>
              )}
            </p>
          )}
        </section>
      </article>

      {similar.length > 0 && (
        <section className="mt-16 border-t border-slate-200 pt-10">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-lg font-bold tracking-tight text-ink">Similar jobs</h2>
            <Link to="/" className="text-sm font-semibold text-brand hover:underline">
              Browse all jobs
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {similar.map((item) => (
              <JobCard
                key={item.id}
                job={item}
                onChange={(next) =>
                  setSimilar((prev) => prev.map((j) => (j.id === next.id ? next : j)))
                }
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
