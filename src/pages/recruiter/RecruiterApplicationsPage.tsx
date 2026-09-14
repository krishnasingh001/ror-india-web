import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { createPortal } from 'react-dom'
import { Link, useSearchParams } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SelectMenu } from '@/components/SelectMenu'
import { api } from '@/lib/api'
import { companyInitial } from '@/lib/format'
import type { Job, JobApplicationComment, RecruiterApplication, RecruiterApplicationStatus } from '@/types'

const STATUSES: RecruiterApplicationStatus[] = [
  'applied',
  'reviewing',
  'shortlisted',
  'rejected',
  'hired',
]

const STATUS_LABELS: Record<RecruiterApplicationStatus, string> = {
  applied: 'Applied',
  reviewing: 'Reviewing',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  hired: 'Hired',
}

const STATUS_ACCENT: Record<
  RecruiterApplicationStatus,
  { dot: string; badge: string; ring: string; header: string }
> = {
  applied: {
    dot: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-600',
    ring: 'ring-slate-300',
    header: 'text-slate-600',
  },
  reviewing: {
    dot: 'bg-sky-500',
    badge: 'bg-sky-50 text-sky-700',
    ring: 'ring-sky-300',
    header: 'text-sky-700',
  },
  shortlisted: {
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-800',
    ring: 'ring-amber-300',
    header: 'text-amber-800',
  },
  rejected: {
    dot: 'bg-brand',
    badge: 'bg-brand-soft text-brand',
    ring: 'ring-brand/30',
    header: 'text-brand',
  },
  hired: {
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700',
    ring: 'ring-emerald-300',
    header: 'text-emerald-700',
  },
}

type Columns = Record<RecruiterApplicationStatus, RecruiterApplication[]>

function emptyColumns(): Columns {
  return {
    applied: [],
    reviewing: [],
    shortlisted: [],
    rejected: [],
    hired: [],
  }
}

function normalizeColumns(data: Record<string, RecruiterApplication[]> | undefined): Columns {
  const next = emptyColumns()
  STATUSES.forEach((status) => {
    next[status] = Array.isArray(data?.[status]) ? [...data![status]] : []
  })
  return next
}

function isStatus(value: string): value is RecruiterApplicationStatus {
  return STATUSES.includes(value as RecruiterApplicationStatus)
}

function findContainer(columns: Columns, id: string | number): RecruiterApplicationStatus | null {
  const key = String(id)
  if (isStatus(key)) return key
  const numeric = Number(key)
  for (const status of STATUSES) {
    if (columns[status].some((app) => app.id === numeric)) return status
  }
  return null
}

export function RecruiterApplicationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const jobId = searchParams.get('job_id') || ''
  const [columns, setColumns] = useState<Columns>(emptyColumns)
  const [jobs, setJobs] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState<number | null>(null)
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null)
  const dragFromRef = useRef<RecruiterApplicationStatus | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  async function loadBoard(filterJobId = jobId) {
    setLoading(true)
    setError(null)
    try {
      const res = await api.fetchRecruiterApplicationsBoard({
        job_id: filterJobId || undefined,
      })
      setColumns(normalizeColumns(res.data))
      setTotal(res.meta.total_count)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load applications board.')
      setColumns(emptyColumns())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    api
      .fetchMyJobs(1, 100)
      .then((res) => setJobs(res.data))
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    void loadBoard(jobId)
  }, [jobId])

  const filteredColumns = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return columns
    const next = emptyColumns()
    STATUSES.forEach((status) => {
      next[status] = columns[status].filter((app) => {
        const hay = [
          app.candidate?.name,
          app.candidate?.email,
          app.job?.title,
          app.job?.company?.name,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return hay.includes(q)
      })
    })
    return next
  }, [columns, query])

  const activeApp = useMemo(() => {
    if (activeId == null) return null
    for (const status of STATUSES) {
      const found = columns[status].find((app) => app.id === activeId)
      if (found) return found
    }
    return null
  }, [activeId, columns])

  const selectedApp = useMemo(() => {
    if (selectedAppId == null) return null
    for (const status of STATUSES) {
      const found = columns[status].find((app) => app.id === selectedAppId)
      if (found) return found
    }
    return null
  }, [selectedAppId, columns])

  function findApp(id: number): { app: RecruiterApplication; status: RecruiterApplicationStatus } | null {
    for (const status of STATUSES) {
      const app = columns[status].find((item) => item.id === id)
      if (app) return { app, status }
    }
    return null
  }

  function upsertApp(app: RecruiterApplication) {
    setColumns((prev) => {
      const target = (isStatus(app.status) ? app.status : 'applied') as RecruiterApplicationStatus
      const next = emptyColumns()
      STATUSES.forEach((status) => {
        next[status] = prev[status].filter((item) => item.id !== app.id)
      })
      next[target] = [app, ...next[target]]
      return next
    })
  }

  async function persistMove(appId: number, toStatus: RecruiterApplicationStatus) {
    try {
      const res = await api.updateApplicationStatus(appId, toStatus)
      upsertApp(res.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update status.')
      await loadBoard(jobId)
    }
  }

  function onDragStart(event: DragStartEvent) {
    const id = Number(event.active.id)
    setActiveId(id)
    const found = findApp(id)
    dragFromRef.current = found?.status ?? null
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return
    const activeContainer = findContainer(columns, active.id)
    const overContainer = findContainer(columns, over.id)
    if (!activeContainer || !overContainer || activeContainer === overContainer) return

    const appId = Number(active.id)
    setColumns((prev) => {
      const app = prev[activeContainer].find((item) => item.id === appId)
      if (!app) return prev
      const next = emptyColumns()
      STATUSES.forEach((s) => {
        next[s] = prev[s].filter((item) => item.id !== appId)
      })
      const overIndex = isStatus(String(over.id))
        ? next[overContainer].length
        : Math.max(
            0,
            next[overContainer].findIndex((item) => item.id === Number(over.id)),
          )
      const list = [...next[overContainer]]
      list.splice(overIndex >= 0 ? overIndex : list.length, 0, {
        ...app,
        status: overContainer,
        status_display: STATUS_LABELS[overContainer],
      })
      next[overContainer] = list
      return next
    })
  }

  function onDragEnd(event: DragEndEvent) {
    const { over } = event
    setActiveId(null)
    const fromStatus = dragFromRef.current
    dragFromRef.current = null
    if (!over || fromStatus == null) return

    const appId = Number(event.active.id)
    const overContainer = findContainer(columns, over.id) || fromStatus
    if (fromStatus !== overContainer) {
      void persistMove(appId, overContainer)
    }
  }

  async function changeAppStatus(appId: number, status: RecruiterApplicationStatus) {
    const found = findApp(appId)
    if (!found || found.status === status) return

    setColumns((prev) => {
      const next = emptyColumns()
      STATUSES.forEach((s) => {
        next[s] = prev[s].filter((item) => item.id !== appId)
      })
      next[status] = [
        {
          ...found.app,
          status,
          status_display: STATUS_LABELS[status],
        },
        ...next[status],
      ]
      return next
    })

    await persistMove(appId, status)
  }

  function setJobFilter(value: string) {
    const next = new URLSearchParams(searchParams)
    if (!value) next.delete('job_id')
    else next.set('job_id', value)
    setSearchParams(next)
  }

  const jobOptions = [
    { value: '', label: 'All jobs' },
    ...jobs.map((j) => ({ value: String(j.id), label: j.title })),
  ]

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface-page">
      <div className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Link
                to="/dashboard"
                className="inline-flex cursor-pointer items-center gap-1 text-[12px] font-medium text-ink-muted transition duration-200 hover:text-brand"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" d="M15 18l-6-6 6-6" />
                </svg>
                Dashboard
              </Link>
              <span className="hidden text-slate-300 sm:inline" aria-hidden="true">
                /
              </span>
              <h1 className="text-[17px] font-semibold tracking-tight text-ink sm:text-[18px]">
                Track applications
              </h1>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-ink-muted">
                {total} applicants
              </span>
            </div>
          </div>

          <label className="relative order-last w-full min-w-[200px] sm:order-none sm:max-w-xs sm:flex-1">
            <span className="sr-only">Search applicants</span>
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" d="m20 20-3-3" />
              </svg>
            </span>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-[13px] text-ink outline-none transition duration-200 placeholder:text-ink-soft hover:border-slate-300 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/15"
              placeholder="Search candidate, email, or job…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>

          <SelectMenu
            className="w-full max-w-[14rem]"
            size="sm"
            value={jobId}
            onChange={setJobFilter}
            options={jobOptions}
            placeholder="All jobs"
          />

          <Link to="/my-jobs" className="btn-secondary !rounded-xl !px-3.5 !py-2 text-[13px]">
            My jobs
          </Link>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-900" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex gap-3 overflow-hidden">
            {STATUSES.map((status) => (
              <div
                key={status}
                className="h-[min(70vh,36rem)] w-[280px] shrink-0 animate-pulse rounded-2xl bg-slate-200/70"
              />
            ))}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
          >
            <div className="flex items-start gap-3 overflow-x-auto pb-8 [-ms-overflow-style:none] [scrollbar-width:thin]">
              {STATUSES.map((status) => (
                <BoardColumn
                  key={status}
                  status={status}
                  apps={filteredColumns[status]}
                  onOpen={(id) => setSelectedAppId(id)}
                />
              ))}
            </div>

            {createPortal(
              <DragOverlay dropAnimation={null}>
                {activeApp ? (
                  <div className="w-[264px] opacity-95">
                    <ApplicantCard app={activeApp} dragging />
                  </div>
                ) : null}
              </DragOverlay>,
              document.body,
            )}
          </DndContext>
        )}

        {!loading && total === 0 && (
          <div className="mt-2 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <p className="text-sm text-ink-muted">No applications yet. When candidates apply to your jobs, they’ll show up here.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Link to="/jobs/new" className="btn-primary cursor-pointer !py-2">
                Post a job
              </Link>
              <Link to="/talent" className="btn-secondary cursor-pointer !py-2">
                Browse talent
              </Link>
            </div>
          </div>
        )}
      </div>

      {selectedApp &&
        createPortal(
          <ApplicantDetailModal
            app={selectedApp}
            onClose={() => setSelectedAppId(null)}
            onStatusChange={(status) => void changeAppStatus(selectedApp.id, status)}
            onAppUpdated={upsertApp}
          />,
          document.body,
        )}
    </div>
  )
}

function BoardColumn({
  status,
  apps,
  onOpen,
}: {
  status: RecruiterApplicationStatus
  apps: RecruiterApplication[]
  onOpen: (id: number) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const ids = apps.map((app) => app.id)
  const accent = STATUS_ACCENT[status]

  return (
    <section
      className={`flex max-h-[calc(100vh-7.5rem)] w-[280px] shrink-0 flex-col rounded-2xl border border-slate-200/80 bg-slate-100/80 transition duration-200 ${
        isOver ? `bg-white shadow-card ring-2 ${accent.ring}` : ''
      }`}
    >
      <header className="flex items-center gap-2 px-3 pb-1 pt-3">
        <span className={`h-2 w-2 shrink-0 rounded-full ${accent.dot}`} aria-hidden="true" />
        <h2 className={`text-[12px] font-bold uppercase tracking-[0.05em] ${accent.header}`}>
          {STATUS_LABELS[status]}
        </h2>
        <span
          className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${accent.badge}`}
        >
          {apps.length}
        </span>
      </header>

      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-2.5 pb-3 pt-1">
          {apps.map((app) => (
            <SortableApplicantCard key={app.id} app={app} onOpen={() => onOpen(app.id)} />
          ))}
          {apps.length === 0 && (
            <div className="flex min-h-[7.5rem] flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-3 py-6 text-center">
              <span className="text-[12px] font-semibold text-ink-muted">No applicants</span>
              <span className="text-[11px] text-ink-soft">Drag a card here</span>
            </div>
          )}
        </div>
      </SortableContext>
    </section>
  )
}

function SortableApplicantCard({
  app,
  onOpen,
}: {
  app: RecruiterApplication
  onOpen: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: app.id,
  })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ApplicantCard app={app} onOpen={onOpen} />
    </div>
  )
}

function ApplicantCard({
  app,
  onOpen,
  dragging = false,
}: {
  app: RecruiterApplication
  onOpen?: () => void
  dragging?: boolean
}) {
  const name = app.candidate?.name || 'Candidate'
  const initial = companyInitial(name)

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen?.()
        }
      }}
      className={`group cursor-pointer rounded-2xl border border-slate-200 bg-white p-3.5 shadow-card outline-none transition duration-200 ease-out focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20 ${
        dragging ? 'border-brand/30 shadow-card-hover' : 'hover:border-slate-300 hover:shadow-card-hover'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-soft text-xs font-bold text-brand">
          {app.candidate?.avatar ? (
            <img src={app.candidate.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[14px] font-semibold leading-5 text-ink">{name}</h3>
          <p className="mt-0.5 truncate text-[12px] text-ink-muted">
            {app.candidate?.current_role || app.job?.title || 'Job'}
          </p>
        </div>
      </div>

      {(app.applied_ago || app.candidate?.location || app.candidate?.email) && (
        <p className="mt-2.5 truncate text-[11px] leading-4 text-ink-muted">
          {[app.applied_ago, app.candidate?.location, app.candidate?.email].filter(Boolean).join(' · ')}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="truncate text-[11px] font-medium text-ink-soft">
          {app.job?.company?.name || 'APP-' + app.id}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            STATUS_ACCENT[isStatus(app.status) ? app.status : 'applied'].badge
          }`}
        >
          {app.status_display || app.status}
        </span>
      </div>
    </article>
  )
}

function ApplicantDetailModal({
  app,
  onClose,
  onStatusChange,
  onAppUpdated,
}: {
  app: RecruiterApplication
  onClose: () => void
  onStatusChange: (status: RecruiterApplicationStatus) => void
  onAppUpdated: (app: RecruiterApplication) => void
}) {
  const [detail, setDetail] = useState<RecruiterApplication>(app)
  const [loadingDetail, setLoadingDetail] = useState(true)
  const [comments, setComments] = useState<JobApplicationComment[]>([])
  const [loadingComments, setLoadingComments] = useState(true)
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)
  const [commentError, setCommentError] = useState<string | null>(null)

  const profile = detail.profile
  const name = detail.candidate?.name || profile?.full_name || 'Candidate'
  const role = profile?.current_role || detail.candidate?.current_role || detail.job?.title
  const avatar = detail.candidate?.avatar || profile?.profile_picture_url
  const initial = companyInitial(name)
  const statusValue = isStatus(detail.status) ? detail.status : 'applied'

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    let cancelled = false
    setLoadingDetail(true)
    api
      .fetchRecruiterApplication(app.id)
      .then((res) => {
        if (cancelled) return
        setDetail(res.data)
        onAppUpdated(res.data)
      })
      .catch(() => {
        if (!cancelled) setDetail(app)
      })
      .finally(() => {
        if (!cancelled) setLoadingDetail(false)
      })
    return () => {
      cancelled = true
    }
  }, [app.id])

  useEffect(() => {
    let cancelled = false
    setLoadingComments(true)
    setCommentError(null)
    api
      .fetchRecruiterApplicationComments(app.id)
      .then((res) => {
        if (!cancelled) setComments(res.data || [])
      })
      .catch((err) => {
        if (!cancelled) {
          setComments([])
          setCommentError(err instanceof Error ? err.message : 'Could not load comments.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingComments(false)
      })
    return () => {
      cancelled = true
    }
  }, [app.id])

  useEffect(() => {
    setDetail((prev) => ({ ...prev, ...app, profile: prev.profile || app.profile }))
  }, [app.status, app.status_display, app.id])

  async function postComment() {
    const body = draft.trim()
    if (!body || posting) return
    setPosting(true)
    setCommentError(null)
    try {
      const res = await api.createRecruiterApplicationComment(app.id, body)
      setComments((prev) => [...prev, res.data])
      setDraft('')
      setDetail((prev) => ({
        ...prev,
        comments_count: res.meta?.comments_count ?? (prev.comments_count || 0) + 1,
      }))
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : 'Could not post comment.')
    } finally {
      setPosting(false)
    }
  }

  async function removeComment(commentId: number) {
    if (!window.confirm('Delete this comment?')) return
    const snapshot = comments
    setComments((prev) => prev.filter((c) => c.id !== commentId))
    try {
      const res = await api.deleteRecruiterApplicationComment(app.id, commentId)
      setDetail((prev) => ({
        ...prev,
        comments_count: res.meta?.comments_count ?? Math.max(0, (prev.comments_count || 1) - 1),
      }))
    } catch (err) {
      setComments(snapshot)
      setCommentError(err instanceof Error ? err.message : 'Could not delete comment.')
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 cursor-pointer bg-slate-900/40" aria-label="Close" onClick={onClose} />
      <div className="relative z-[81] flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-panel sm:rounded-2xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-soft text-sm font-bold text-brand">
              {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : initial}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-ink">{name}</h2>
              <p className="truncate text-sm text-ink-muted">{role}</p>
              {(profile?.current_company || detail.candidate?.current_company || detail.candidate?.location) && (
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {[profile?.current_company || detail.candidate?.current_company, profile?.location || detail.candidate?.location]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-ink-muted hover:bg-slate-100 hover:text-ink"
            aria-label="Close"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {loadingDetail ? (
            <div className="space-y-3">
              <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div className="space-y-5">
                {(profile?.bio || profile?.career_summary) && (
                  <section>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">About</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                      {profile?.career_summary || profile?.bio}
                    </p>
                  </section>
                )}

                {!!profile?.skills?.length && (
                  <section>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Skills</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {profile.skills.map((skill) => (
                        <span key={skill} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {!!profile?.work_experience_details?.length && (
                  <section>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Experience</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {profile.work_experience_details.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </section>
                )}

                <section>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Details</p>
                  <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                    <MiniDetail
                      label="Experience"
                      value={
                        profile?.experience != null || detail.candidate?.experience != null
                          ? `${profile?.experience ?? detail.candidate?.experience} years`
                          : null
                      }
                    />
                    <MiniDetail label="Notice" value={profile?.notice_period} />
                    <MiniDetail label="Expected CTC" value={profile?.expected_ctc_label} />
                    <MiniDetail
                      label="Education"
                      value={[profile?.highest_qualification, profile?.university].filter(Boolean).join(', ') || null}
                    />
                    <MiniDetail
                      label="Preferred locations"
                      value={profile?.preferred_locations?.length ? profile.preferred_locations.join(', ') : null}
                    />
                    <MiniDetail label="Job type" value={profile?.job_type} />
                  </dl>
                </section>

                {(profile?.linkedin_profile || profile?.github_profile || profile?.portfolio_website || profile?.resume?.url) && (
                  <section>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Links & resume</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {profile?.resume?.url && (
                        <a
                          href={profile.resume.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary cursor-pointer !py-2"
                        >
                          {profile.resume.filename ? `Resume (${profile.resume.filename})` : 'Download resume'}
                        </a>
                      )}
                      {profile?.linkedin_profile && (
                        <a
                          href={profile.linkedin_profile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary cursor-pointer !py-2"
                        >
                          LinkedIn
                        </a>
                      )}
                      {profile?.github_profile && (
                        <a
                          href={profile.github_profile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary cursor-pointer !py-2"
                        >
                          GitHub
                        </a>
                      )}
                      {profile?.portfolio_website && (
                        <a
                          href={profile.portfolio_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary cursor-pointer !py-2"
                        >
                          Portfolio
                        </a>
                      )}
                    </div>
                  </section>
                )}

                {!profile && (
                  <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink-muted">
                    This candidate hasn’t completed a developer profile yet.
                  </p>
                )}

                <section className="border-t border-slate-100 pt-5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Comments{detail.comments_count != null ? ` · ${detail.comments_count}` : ''}
                    </p>
                  </div>

                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                    <textarea
                      className="input-field min-h-[88px] bg-white"
                      placeholder="Add a comment about this candidate…"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault()
                          void postComment()
                        }
                      }}
                    />
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[11px] text-slate-500">
                        <kbd className="rounded border border-slate-200 bg-white px-1 font-semibold">⌘</kbd>
                        {' + '}
                        <kbd className="rounded border border-slate-200 bg-white px-1 font-semibold">Enter</kbd> to comment
                      </p>
                      <button
                        type="button"
                        disabled={!draft.trim() || posting}
                        onClick={() => void postComment()}
                        className="btn-primary cursor-pointer !py-2 disabled:opacity-50"
                      >
                        {posting ? 'Posting…' : 'Comment'}
                      </button>
                    </div>
                  </div>

                  {commentError && (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                      {commentError}
                    </p>
                  )}

                  <div className="mt-4 space-y-3">
                    {loadingComments ? (
                      <p className="text-sm text-ink-muted">Loading comments…</p>
                    ) : comments.length === 0 ? (
                      <p className="text-sm text-ink-muted">No comments yet. Start the conversation.</p>
                    ) : (
                      [...comments].reverse().map((comment) => (
                        <article key={comment.id} className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                          <div className="flex items-start gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                              {comment.user_initials}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <span className="text-sm font-semibold text-ink">{comment.user_name || 'User'}</span>
                                <span className="text-xs text-slate-500">{comment.created_ago}</span>
                              </div>
                              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{comment.body}</p>
                              {comment.can_delete && (
                                <button
                                  type="button"
                                  className="mt-2 cursor-pointer text-xs font-semibold text-red-600 hover:text-red-700"
                                  onClick={() => void removeComment(comment.id)}
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </section>
              </div>

              <aside className="space-y-5 lg:border-l lg:border-slate-100 lg:pl-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Pipeline status</p>
                  <div className="mt-2">
                    <SelectMenu
                      value={statusValue}
                      onChange={(v) => onStatusChange(v as RecruiterApplicationStatus)}
                      options={STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
                    />
                  </div>
                </div>

                <dl className="grid gap-3 text-sm">
                  <DetailRow
                    label="Email"
                    value={detail.candidate?.email}
                    href={detail.candidate?.email ? `mailto:${detail.candidate.email}` : undefined}
                  />
                  <DetailRow
                    label="Phone"
                    value={profile?.phone || detail.candidate?.phone}
                    href={
                      profile?.phone || detail.candidate?.phone
                        ? `tel:${profile?.phone || detail.candidate?.phone}`
                        : undefined
                    }
                  />
                  <DetailRow label="Applied" value={detail.applied_ago || detail.applied_at} />
                  <DetailRow label="Job" value={detail.job?.title} href={detail.job ? `/jobs/${detail.job.id}` : undefined} />
                  <DetailRow label="Company" value={detail.job?.company?.name} />
                </dl>

                <div className="flex flex-wrap gap-2">
                  {detail.candidate?.profile_id && (
                    <Link
                      to={`/talent/${detail.candidate.profile_id}`}
                      className="btn-primary cursor-pointer !py-2"
                      onClick={onClose}
                    >
                      View full profile
                    </Link>
                  )}
                  {detail.candidate?.email && (
                    <a href={`mailto:${detail.candidate.email}`} className="btn-secondary cursor-pointer !py-2">
                      Email candidate
                    </a>
                  )}
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MiniDetail({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-ink">{value}</p>
    </div>
  )
}

function DetailRow({
  label,
  value,
  href,
}: {
  label: string
  value?: string | null
  href?: string
}) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-3 border-b border-slate-100 pb-2 last:border-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-ink">
        {href ? (
          href.startsWith('mailto:') || href.startsWith('tel:') ? (
            <a href={href} className="text-brand hover:text-brand-hover">
              {value}
            </a>
          ) : (
            <Link to={href} className="text-brand hover:text-brand-hover">
              {value}
            </Link>
          )
        ) : (
          value
        )}
      </dd>
    </div>
  )
}
