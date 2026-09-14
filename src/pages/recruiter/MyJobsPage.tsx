import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pagination } from '@/components/Pagination'
import { api } from '@/lib/api'
import type { Job } from '@/types'

export function MyJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    api
      .fetchMyJobs(page)
      .then((res) => {
        if (cancelled) return
        setJobs(res.data)
        setTotalPages(res.meta.total_pages)
        setTotalCount(res.meta.total_count)
        setPerPage(res.meta.per_page)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load jobs')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [page])

  function goToPage(nextPage: number) {
    setPage(nextPage)
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function onDelete(job: Job) {
    if (!window.confirm(`Delete “${job.title}”? This cannot be undone.`)) return
    setDeletingId(job.id)
    try {
      await api.deleteJob(job.id)
      const remaining = jobs.filter((j) => j.id !== job.id)
      setJobs(remaining)
      setTotalCount((c) => Math.max(0, c - 1))
      if (remaining.length === 0 && page > 1) {
        setPage((p) => p - 1)
      } else {
        setTotalPages(Math.max(1, Math.ceil(Math.max(0, totalCount - 1) / perPage)))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete job')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Hiring</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">My posted jobs</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Manage openings and review applicants
            {!loading && totalCount > 0 ? ` · ${totalCount} total` : ''}.
          </p>
        </div>
        <Link to="/jobs/new" className="btn-primary cursor-pointer">
          Post a job
        </Link>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div ref={listRef} className="scroll-mt-24">
        {loading ? (
          <div className="mt-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-white shadow-card" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <p className="text-ink-muted">You haven’t posted any jobs yet.</p>
            <Link to="/jobs/new" className="btn-primary mt-4 inline-flex cursor-pointer">
              Post your first job
            </Link>
          </div>
        ) : (
          <ul className="mt-8 list-none space-y-3 p-0">
            {jobs.map((job) => (
              <li
                key={job.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition duration-200 hover:border-brand/20"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link to={`/jobs/${job.id}`} className="text-lg font-bold text-ink hover:text-brand">
                        {job.title}
                      </Link>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                          job.active === false
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {job.active === false ? 'Inactive' : 'Active'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink-muted">
                      {[job.company?.name, job.location_short || job.location, job.job_type]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      <span className="font-semibold text-ink">{job.applications_count ?? 0}</span> applications
                      {job.views_count != null && (
                        <>
                          <span className="mx-1.5 text-slate-300">·</span>
                          {job.views_count} views
                        </>
                      )}
                      <span className="mx-1.5 text-slate-300">·</span>
                      Posted {job.posted_on}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/recruiter/applications?job_id=${job.id}`}
                      className="btn-secondary cursor-pointer !py-2"
                    >
                      Applications
                    </Link>
                    <Link to={`/jobs/${job.id}/edit`} className="btn-secondary cursor-pointer !py-2">
                      Edit
                    </Link>
                    <button
                      type="button"
                      disabled={deletingId === job.id}
                      onClick={() => void onDelete(job)}
                      className="cursor-pointer rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      {deletingId === job.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!loading && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            perPage={perPage}
            onChange={goToPage}
            label="jobs"
          />
        )}
      </div>
    </div>
  )
}
