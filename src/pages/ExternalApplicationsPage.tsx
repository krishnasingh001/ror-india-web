import { FormEvent, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
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
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { companyInitial } from '@/lib/format'
import { SelectMenu } from '@/components/SelectMenu'
import { DatePicker } from '@/components/DatePicker'
import type {
  ExternalApplication,
  ExternalApplicationActivity,
  ExternalApplicationComment,
  ExternalApplicationInput,
  ExternalApplicationSource,
  ExternalApplicationStatus,
} from '@/types'

const STATUSES: ExternalApplicationStatus[] = [
  'applied',
  'screening',
  'interview',
  'offered',
  'rejected',
  'withdrawn',
]

const STATUS_LABELS: Record<ExternalApplicationStatus, string> = {
  applied: 'Applied',
  screening: 'Screening',
  interview: 'Interview',
  offered: 'Offered',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

const STATUS_ACCENT: Record<
  ExternalApplicationStatus,
  { dot: string; badge: string; ring: string; header: string }
> = {
  applied: {
    dot: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-600',
    ring: 'ring-slate-300',
    header: 'text-slate-600',
  },
  screening: {
    dot: 'bg-sky-500',
    badge: 'bg-sky-50 text-sky-700',
    ring: 'ring-sky-300',
    header: 'text-sky-700',
  },
  interview: {
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-800',
    ring: 'ring-amber-300',
    header: 'text-amber-800',
  },
  offered: {
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700',
    ring: 'ring-emerald-300',
    header: 'text-emerald-700',
  },
  rejected: {
    dot: 'bg-brand',
    badge: 'bg-brand-soft text-brand',
    ring: 'ring-brand/30',
    header: 'text-brand',
  },
  withdrawn: {
    dot: 'bg-slate-300',
    badge: 'bg-slate-50 text-slate-500',
    ring: 'ring-slate-200',
    header: 'text-slate-500',
  },
}

const SOURCE_COLORS: Record<string, string> = {
  linkedin: '#0A66C2',
  indeed: '#2164F3',
  naukri: '#2557A7',
  company_website: '#0052CC',
  referral: '#00875A',
  other: '#FF8B00',
}

const SOURCES: { value: ExternalApplicationSource; label: string }[] = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'indeed', label: 'Indeed' },
  { value: 'naukri', label: 'Naukri' },
  { value: 'company_website', label: 'Company website' },
  { value: 'referral', label: 'Referral' },
  { value: 'other', label: 'Other' },
]

type Columns = Record<ExternalApplicationStatus, ExternalApplication[]>

function emptyColumns(): Columns {
  return {
    applied: [],
    screening: [],
    interview: [],
    offered: [],
    rejected: [],
    withdrawn: [],
  }
}

function normalizeColumns(data: Record<string, ExternalApplication[]> | undefined): Columns {
  const next = emptyColumns()
  STATUSES.forEach((status) => {
    next[status] = Array.isArray(data?.[status]) ? [...data![status]] : []
  })
  return next
}

function isStatus(value: string): value is ExternalApplicationStatus {
  return STATUSES.includes(value as ExternalApplicationStatus)
}

function findContainer(columns: Columns, id: string | number): ExternalApplicationStatus | null {
  const key = String(id)
  if (isStatus(key)) return key
  const numeric = Number(key)
  for (const status of STATUSES) {
    if (columns[status].some((app) => app.id === numeric)) return status
  }
  return null
}

export function ExternalApplicationsPage() {
  const { user } = useAuth()
  const [columns, setColumns] = useState<Columns>(emptyColumns)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState<number | null>(null)
  const [modalStatus, setModalStatus] = useState<ExternalApplicationStatus | null>(null)
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({})
  const [activityTick, setActivityTick] = useState(0)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  async function loadBoard() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.externalApplicationsBoard()
      setColumns(normalizeColumns(res.data))
      setTotal(res.meta.total_count)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load board.')
      setColumns(emptyColumns())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadBoard()
  }, [])

  const filteredColumns = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return columns
    const next = emptyColumns()
    STATUSES.forEach((status) => {
      next[status] = columns[status].filter((app) => {
        const hay = [app.job_title, app.company_name, app.source_display, app.location]
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

  function upsertApp(app: ExternalApplication) {
    setColumns((prev) => {
      const target = (app.status as ExternalApplicationStatus) || 'applied'
      const next = emptyColumns()
      let oldIndex = -1

      STATUSES.forEach((status) => {
        const idx = prev[status].findIndex((item) => item.id === app.id)
        if (idx >= 0 && status === target) oldIndex = idx
        next[status] = prev[status].filter((item) => item.id !== app.id)
      })

      if (oldIndex >= 0) {
        const list = [...next[target]]
        list.splice(oldIndex, 0, app)
        next[target] = list
      } else {
        next[target] = [app, ...next[target]]
      }
      return next
    })
  }

  function findApp(id: number): { app: ExternalApplication; status: ExternalApplicationStatus } | null {
    for (const status of STATUSES) {
      const app = columns[status].find((item) => item.id === id)
      if (app) return { app, status }
    }
    return null
  }

  async function persistMove(
    appId: number,
    fromStatus: ExternalApplicationStatus,
    toStatus: ExternalApplicationStatus,
    toIndex: number,
  ) {
    try {
      await api.updateExternalApplicationStatus(appId, toStatus, toIndex)
      if (fromStatus !== toStatus) setActivityTick((n) => n + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not move card.')
      await loadBoard()
    }
  }

  function onDragStart(event: DragStartEvent) {
    setActiveId(Number(event.active.id))
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeContainer = findContainer(columns, active.id)
    const overContainer = findContainer(columns, over.id)
    if (!activeContainer || !overContainer || activeContainer === overContainer) return

    setColumns((prev) => {
      const activeItems = [...prev[activeContainer]]
      const overItems = [...prev[overContainer]]
      const activeIndex = activeItems.findIndex((item) => item.id === Number(active.id))
      if (activeIndex < 0) return prev

      const [moved] = activeItems.splice(activeIndex, 1)
      const overIndex = isStatus(String(over.id))
        ? overItems.length
        : overItems.findIndex((item) => item.id === Number(over.id))

      const insertAt = overIndex >= 0 ? overIndex : overItems.length
      const nextMoved = {
        ...moved,
        status: overContainer,
        status_display: STATUS_LABELS[overContainer],
      }
      overItems.splice(insertAt, 0, nextMoved)

      return {
        ...prev,
        [activeContainer]: activeItems,
        [overContainer]: overItems,
      }
    })
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    const appId = Number(active.id)
    const from = findApp(appId)
    if (!from) return

    const overContainer = findContainer(columns, over.id) || from.status
    const list = columns[overContainer]
    let toIndex = list.findIndex((item) => item.id === appId)
    if (toIndex < 0) {
      const overIndex = list.findIndex((item) => item.id === Number(over.id))
      toIndex = overIndex >= 0 ? overIndex : list.length
    }

    // Reorder within same column if needed
    if (from.status === overContainer) {
      const oldIndex = columns[from.status].findIndex((item) => item.id === appId)
      if (oldIndex !== toIndex && oldIndex >= 0) {
        setColumns((prev) => {
          const items = [...prev[from.status]]
          const [moved] = items.splice(oldIndex, 1)
          items.splice(toIndex, 0, moved)
          return { ...prev, [from.status]: items }
        })
      }
    }

    void persistMove(appId, from.status, overContainer, Math.max(0, toIndex))
  }

  async function removeCard(appId: number) {
    if (!window.confirm('Remove this application from your tracker?')) return
    const snapshot = columns
    setColumns((prev) => {
      const next = emptyColumns()
      STATUSES.forEach((s) => {
        next[s] = prev[s].filter((item) => item.id !== appId)
      })
      return next
    })
    setTotal((t) => Math.max(0, t - 1))
    if (selectedAppId === appId) setSelectedAppId(null)
    try {
      const res = await api.deleteExternalApplication(appId)
      if (res.meta?.total_count != null) setTotal(res.meta.total_count)
    } catch (e) {
      setColumns(snapshot)
      setError(e instanceof Error ? e.message : 'Could not delete application.')
    }
  }

  async function saveAppDetails(appId: number, payload: ExternalApplicationInput) {
    setSaving(true)
    setFormErrors({})
    try {
      const res = await api.updateExternalApplication(appId, payload)
      upsertApp(res.data)
      return true
    } catch (err: unknown) {
      const e = err as { message?: string; payload?: { errors?: Record<string, string[]>; message?: string } }
      setFormErrors(e.payload?.errors || {})
      setError(e.payload?.message || e.message || 'Could not save application.')
      return false
    } finally {
      setSaving(false)
    }
  }

  async function changeAppStatus(appId: number, status: ExternalApplicationStatus) {
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
    try {
      const res = await api.updateExternalApplicationStatus(appId, status, 0)
      upsertApp(res.data)
      setActivityTick((n) => n + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update status.')
      await loadBoard()
    }
  }

  async function createCard(payload: ExternalApplicationInput) {
    setSaving(true)
    setFormErrors({})
    try {
      const res = await api.createExternalApplication(payload)
      const status = (res.data.status as ExternalApplicationStatus) || 'applied'
      setColumns((prev) => ({
        ...prev,
        [status]: [...prev[status], res.data],
      }))
      setTotal(res.meta?.total_count ?? total + 1)
      setModalStatus(null)
    } catch (err: unknown) {
      const e = err as { message?: string; payload?: { errors?: Record<string, string[]>; message?: string } }
      setFormErrors(e.payload?.errors || {})
      setError(e.payload?.message || e.message || 'Could not create application.')
    } finally {
      setSaving(false)
    }
  }

  const initials = companyInitial(user?.name || 'U')

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
              <h1 className="text-[17px] font-semibold tracking-tight text-ink sm:text-[18px]">Track Applications</h1>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-ink-muted">
                {total} tracked
              </span>
            </div>
          </div>

          <label className="relative order-last w-full min-w-[220px] sm:order-none sm:max-w-sm sm:flex-1">
            <span className="sr-only">Search applications</span>
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" d="m20 20-3-3" />
              </svg>
            </span>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-[13px] text-ink outline-none transition duration-200 placeholder:text-ink-soft hover:border-slate-300 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/15"
              placeholder="Search company, role, or source…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>

          <button
            type="button"
            onClick={() => setModalStatus('applied')}
            className="btn-primary !rounded-xl !px-3.5 !py-2 text-[13px]"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path strokeLinecap="round" d="M12 5v14M5 12h14" />
            </svg>
            Track application
          </button>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-900">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex gap-3 overflow-hidden">
            {STATUSES.map((status) => (
              <div key={status} className="h-[min(70vh,36rem)] w-[280px] shrink-0 animate-pulse rounded-2xl bg-slate-200/70" />
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
                  userInitials={initials}
                  onAdd={() => setModalStatus(status)}
                  onOpen={(id) => setSelectedAppId(id)}
                  onDelete={(id) => void removeCard(id)}
                />
              ))}
            </div>

            {createPortal(
              <DragOverlay dropAnimation={null}>
                {activeApp ? (
                  <div className="w-[264px] opacity-95">
                    <JiraCard app={activeApp} userInitials={initials} dragging />
                  </div>
                ) : null}
              </DragOverlay>,
              document.body,
            )}
          </DndContext>
        )}
      </div>

      {modalStatus &&
        createPortal(
          <AddApplicationModal
            status={modalStatus}
            saving={saving}
            errors={formErrors}
            onClose={() => {
              if (!saving) {
                setModalStatus(null)
                setFormErrors({})
              }
            }}
            onSubmit={(payload) => void createCard(payload)}
          />,
          document.body,
        )}

      {selectedApp &&
        createPortal(
          <ApplicationDetailModal
            app={selectedApp}
            userName={user?.name || 'You'}
            userInitials={initials}
            saving={saving}
            errors={formErrors}
            activityTick={activityTick}
            onClose={() => {
              setSelectedAppId(null)
              setFormErrors({})
            }}
            onDelete={() => void removeCard(selectedApp.id)}
            onStatusChange={(status) => void changeAppStatus(selectedApp.id, status)}
            onSave={(payload) => saveAppDetails(selectedApp.id, payload)}
          />,
          document.body,
        )}
    </div>
  )
}

function BoardColumn({
  status,
  apps,
  userInitials,
  onAdd,
  onOpen,
  onDelete,
}: {
  status: ExternalApplicationStatus
  apps: ExternalApplication[]
  userInitials: string
  onAdd: () => void
  onOpen: (id: number) => void
  onDelete: (id: number) => void
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
        <span className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${accent.badge}`}>
          {apps.length}
        </span>
        <button
          type="button"
          onClick={onAdd}
          className="ml-auto inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-ink-muted transition duration-200 hover:bg-white hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          aria-label={`Add to ${STATUS_LABELS[status]}`}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </header>

      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-2.5 pb-3 pt-1">
          {apps.map((app) => (
            <SortableJiraCard
              key={app.id}
              app={app}
              userInitials={userInitials}
              onOpen={() => onOpen(app.id)}
              onDelete={() => onDelete(app.id)}
            />
          ))}
          {apps.length === 0 && (
            <button
              type="button"
              onClick={onAdd}
              className="flex min-h-[7.5rem] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-3 py-6 text-center transition duration-200 hover:border-brand/40 hover:bg-brand-soft/40"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-ink-muted">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                </svg>
              </span>
              <span className="text-[12px] font-semibold text-ink">Add to {STATUS_LABELS[status]}</span>
              <span className="text-[11px] text-ink-muted">Or drag a card here</span>
            </button>
          )}
        </div>
      </SortableContext>
    </section>
  )
}

function SortableJiraCard({
  app,
  userInitials,
  onOpen,
  onDelete,
}: {
  app: ExternalApplication
  userInitials: string
  onOpen: () => void
  onDelete: () => void
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
      <JiraCard app={app} userInitials={userInitials} onOpen={onOpen} onDelete={onDelete} />
    </div>
  )
}

function JiraCard({
  app,
  userInitials,
  onOpen,
  onDelete,
  dragging = false,
}: {
  app: ExternalApplication
  userInitials: string
  onOpen?: () => void
  onDelete?: () => void
  dragging?: boolean
}) {
  const sourceColor = SOURCE_COLORS[app.source] || SOURCE_COLORS.other
  const ticketId = `EXT-${app.id}`

  function openJob(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (app.job_url) window.open(app.job_url, '_blank', 'noopener,noreferrer')
  }

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
        dragging
          ? 'border-brand/30 shadow-card-hover'
          : 'hover:border-slate-300 hover:shadow-card-hover'
      }`}
    >
      <h3 className="text-[14px] font-semibold leading-5 text-ink">{app.job_title}</h3>

      <div className="mt-2.5">
        <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] leading-4 text-ink-muted">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: sourceColor }} />
          <span className="truncate font-medium text-ink">{app.company_name}</span>
        </span>
      </div>

      {(app.location || app.applied_on) && (
        <p className="mt-2 truncate text-[11px] leading-4 text-ink-muted">
          {[app.location, app.applied_on].filter(Boolean).join(' · ')}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5 text-ink-muted">
          <span title={app.status_display} className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-brand">
            <StoryIcon />
          </span>
          <span className="truncate text-[12px] font-medium tracking-tight text-ink-muted">{ticketId}</span>
          {app.job_url && (
            <button
              type="button"
              onClick={openJob}
              className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg text-ink-muted opacity-0 transition duration-200 hover:bg-slate-100 hover:text-ink group-hover:opacity-100 focus-visible:opacity-100"
              title="Open job"
            >
              <ExternalLinkIcon />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onDelete()
              }}
              className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg text-ink-muted opacity-0 transition duration-200 hover:bg-brand-soft hover:text-brand group-hover:opacity-100 focus-visible:opacity-100"
              title="Delete"
            >
              <TrashIcon />
            </button>
          )}
        </div>

        <span
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white"
          title="You"
        >
          {userInitials}
        </span>
      </div>
    </article>
  )
}

function StoryIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M8 1.5 2.5 12.5h11L8 1.5Zm0 3.2 3.2 6.3H4.8L8 4.7Z" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" d="M14 5h5v5M10 14 19 5M19 13v6a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" d="M4 7h16M9 7V5h6v2M8 7l1 13h6l1-13" />
    </svg>
  )
}

function stripHtml(value: string | null | undefined) {
  if (!value) return ''
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

type ActivityTab = 'all' | 'comments' | 'history'

function ActivitySection({
  applicationId,
  userInitials,
  activityTick,
}: {
  applicationId: number
  userInitials: string
  activityTick: number
}) {
  const [tab, setTab] = useState<ActivityTab>('all')
  const [comments, setComments] = useState<ExternalApplicationComment[]>([])
  const [activities, setActivities] = useState<ExternalApplicationActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function loadActivity() {
    setLoading(true)
    setError(null)
    try {
      const [commentsRes, activitiesRes] = await Promise.all([
        api.externalApplicationComments(applicationId),
        api.externalApplicationActivities(applicationId),
      ])
      setComments(commentsRes.data || [])
      setActivities(activitiesRes.data || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load activity.')
      setComments([])
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadActivity()
  }, [applicationId, activityTick])

  const prevTickRef = useRef(activityTick)
  useEffect(() => {
    if (activityTick !== prevTickRef.current) {
      prevTickRef.current = activityTick
      setTab('history')
    }
  }, [activityTick])

  useEffect(() => {
    setTab('all')
  }, [applicationId])

  async function postComment() {
    const body = draft.trim()
    if (!body || posting) return
    setPosting(true)
    setError(null)
    try {
      const res = await api.createExternalApplicationComment(applicationId, body)
      setComments((prev) => [...prev, res.data])
      setDraft('')
      setTab('comments')
    } catch (err: unknown) {
      const ex = err as { message?: string }
      setError(ex.message || 'Could not post comment.')
    } finally {
      setPosting(false)
    }
  }

  async function removeComment(commentId: number) {
    if (!window.confirm('Delete this comment?')) return
    const snapshot = comments
    setComments((prev) => prev.filter((c) => c.id !== commentId))
    try {
      await api.deleteExternalApplicationComment(applicationId, commentId)
    } catch (e) {
      setComments(snapshot)
      setError(e instanceof Error ? e.message : 'Could not delete comment.')
    }
  }

  function insertSuggestion(text: string) {
    setDraft((prev) => (prev ? `${prev.trim()} ${text}` : text))
  }

  type FeedItem =
    | { type: 'comment'; sortAt: number; comment: ExternalApplicationComment }
    | { type: 'activity'; sortAt: number; activity: ExternalApplicationActivity }

  const feedItems = useMemo(() => {
    const items: FeedItem[] = [
      ...comments.map((comment) => ({
        type: 'comment' as const,
        sortAt: new Date(comment.created_at).getTime(),
        comment,
      })),
      ...activities.map((activity) => ({
        type: 'activity' as const,
        sortAt: new Date(activity.created_at).getTime(),
        activity,
      })),
    ]
    return items.sort((a, b) => b.sortAt - a.sortAt)
  }, [comments, activities])

  const tabs: { id: ActivityTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'comments', label: 'Comments' },
    { id: 'history', label: 'History' },
  ]

  return (
    <section className="mt-10 border-t border-[#ebecf0] pt-6">
      <div className="flex items-center gap-2">
        <h3 className="text-[14px] font-semibold text-[#172b4d]">Activity</h3>
        <svg className="h-3.5 w-3.5 text-[#6b778c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" d="m6 9 6 6 6-6" />
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-full px-3 py-1 text-[12px] font-semibold transition ${
              tab === item.id
                ? 'bg-[#deebff] text-[#0052cc]'
                : 'text-[#5e6c84] hover:bg-[#f4f5f7]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {(tab === 'comments' || tab === 'all') && (
        <div className="mt-4">
          <div className="flex gap-3">
            <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ff5630] text-[11px] font-bold text-white">
              {userInitials}
            </span>
            <div className="min-w-0 flex-1">
              <textarea
                className="min-h-[84px] w-full rounded-2xl border border-[#dfe1e6] bg-white px-3.5 py-3 text-[14px] leading-relaxed text-[#172b4d] outline-none transition placeholder:text-[#97a0af] focus:border-[#4c9aff] focus:ring-2 focus:ring-[#4c9aff]/25"
                placeholder="Add a comment…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault()
                    void postComment()
                  }
                }}
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {['Status update…', 'Thanks…', 'Followed up…'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => insertSuggestion(chip.replace('…', ''))}
                    className="rounded-full border border-[#dfe1e6] bg-[#fafbfc] px-2.5 py-1 text-[11px] font-medium text-[#5e6c84] transition hover:border-[#4c9aff] hover:text-[#0052cc]"
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-[11px] text-[#6b778c]">
                  Pro tip: press <kbd className="rounded border border-[#dfe1e6] bg-[#f4f5f7] px-1 font-semibold">⌘</kbd>+
                  <kbd className="rounded border border-[#dfe1e6] bg-[#f4f5f7] px-1 font-semibold">Enter</kbd> to comment
                </p>
                <button
                  type="button"
                  disabled={posting || !draft.trim()}
                  onClick={() => void postComment()}
                  className="btn-primary !rounded-xl !px-3 !py-1.5 text-[12px] disabled:opacity-50"
                >
                  {posting ? 'Posting…' : 'Comment'}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
              {error}
            </div>
          )}
        </div>
      )}

      <div className="mt-5 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-[#f4f5f7]" />
            ))}
          </div>
        ) : tab === 'comments' ? (
          comments.length === 0 ? (
            <p className="py-2 text-[13px] text-[#6b778c]">No comments yet. Start the conversation.</p>
          ) : (
            [...comments].reverse().map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={() => insertSuggestion(`@${comment.user_name || 'User'} `)}
                onDelete={() => void removeComment(comment.id)}
              />
            ))
          )
        ) : tab === 'history' ? (
          activities.length === 0 ? (
            <p className="py-2 text-[13px] text-[#6b778c]">No status history yet. Change the status to log activity.</p>
          ) : (
            activities.map((activity) => <HistoryItem key={activity.id} activity={activity} />)
          )
        ) : feedItems.length === 0 ? (
          <p className="py-2 text-[13px] text-[#6b778c]">No activity yet.</p>
        ) : (
          feedItems.map((item) =>
            item.type === 'comment' ? (
              <CommentItem
                key={`c-${item.comment.id}`}
                comment={item.comment}
                onReply={() => insertSuggestion(`@${item.comment.user_name || 'User'} `)}
                onDelete={() => void removeComment(item.comment.id)}
              />
            ) : (
              <HistoryItem key={`a-${item.activity.id}`} activity={item.activity} />
            ),
          )
        )}
      </div>
    </section>
  )
}

function CommentItem({
  comment,
  onReply,
  onDelete,
}: {
  comment: ExternalApplicationComment
  onReply: () => void
  onDelete: () => void
}) {
  return (
    <article className="flex gap-3">
      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0052cc] text-[11px] font-bold text-white">
        {comment.user_initials}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-[13px] font-semibold text-[#172b4d]">{comment.user_name || 'User'}</span>
          <span className="text-[12px] text-[#6b778c]">{comment.created_ago}</span>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-[14px] leading-relaxed text-[#172b4d]">{comment.body}</p>
        <div className="mt-2 flex items-center gap-3 text-[12px] font-medium text-[#5e6c84]">
          <button type="button" className="hover:text-[#0052cc]" onClick={onReply}>
            Reply
          </button>
          {comment.can_delete && (
            <button type="button" className="hover:text-[#de350b]" onClick={onDelete}>
              Delete
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

function HistoryItem({ activity }: { activity: ExternalApplicationActivity }) {
  return (
    <div className="flex gap-3">
      <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dfe1e6] text-[#5e6c84]">
        {activity.kind === 'status_change' ? (
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M7 7h10M7 12h7M7 17h4" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" d="M12 7v5l3 2" />
          </svg>
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-[#172b4d]">
          {activity.message}
          {activity.kind === 'status_change' && activity.from_label && activity.to_label && (
            <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-[#f4f5f7] px-2 py-0.5 text-[11px] font-semibold text-[#5e6c84]">
                {activity.from_label}
              </span>
              <span className="text-[#97a0af]">→</span>
              <span className="rounded-full bg-[#deebff] px-2 py-0.5 text-[11px] font-semibold text-[#0052cc]">
                {activity.to_label}
              </span>
            </span>
          )}
        </p>
        <p className="mt-0.5 text-[12px] text-[#6b778c]">{activity.created_ago}</p>
      </div>
    </div>
  )
}

function ApplicationDetailModal({
  app,
  userName,
  userInitials,
  saving,
  errors,
  activityTick,
  onClose,
  onDelete,
  onStatusChange,
  onSave,
}: {
  app: ExternalApplication
  userName: string
  userInitials: string
  saving: boolean
  errors: Record<string, string[]>
  activityTick: number
  onClose: () => void
  onDelete: () => void
  onStatusChange: (status: ExternalApplicationStatus) => void
  onSave: (payload: ExternalApplicationInput) => Promise<boolean>
}) {
  const sourceColor = SOURCE_COLORS[app.source] || SOURCE_COLORS.other
  const [form, setForm] = useState(() => formFromApp(app))
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const lastSavedRef = useRef(serializeForm(formFromApp(app)))
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onSaveRef = useRef(onSave)
  onSaveRef.current = onSave

  useEffect(() => {
    const next = formFromApp(app)
    setForm(next)
    lastSavedRef.current = serializeForm(next)
    setSaveState('idle')
  }, [app.id])

  useEffect(() => {
    const serialized = serializeForm(form)
    if (serialized === lastSavedRef.current) return
    if (!form.job_title.trim() || !form.company_name.trim()) return

    const payload = payloadFromForm(form)
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    setSaveState('saving')
    saveTimerRef.current = setTimeout(() => {
      void (async () => {
        const ok = await onSaveRef.current(payload)
        if (ok) {
          lastSavedRef.current = serialized
          setSaveState('saved')
        } else {
          setSaveState('error')
        }
      })()
    }, 650)

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [form])

  useEffect(() => {
    if (saving) setSaveState('saving')
  }, [saving])

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-[#091e42]/55 p-3 sm:items-center sm:p-6" onClick={onClose}>
      <div
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#dfe1e6] bg-white shadow-[0_16px_40px_rgba(9,30,66,0.28)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ext-detail-title"
      >
        <header className="flex items-center justify-between gap-3 border-b border-[#ebecf0] px-4 py-3 sm:px-5">
          <nav className="flex min-w-0 items-center gap-2 text-[12px] text-[#5e6c84]">
            <span className="truncate">Track Applications</span>
            <span aria-hidden="true">/</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#172b4d]">
              <span className="text-[#6554c0]"><StoryIcon /></span>
              EXT-{app.id}
            </span>
          </nav>
          <div className="flex items-center gap-1">
            <span className="mr-2 hidden text-[11px] font-medium text-[#6b778c] sm:inline" aria-live="polite">
              {saveState === 'saving' && 'Saving…'}
              {saveState === 'saved' && 'Saved'}
              {saveState === 'error' && 'Couldn’t save'}
            </span>
            {app.job_url && (
              <a
                href={app.job_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-[#5e6c84] hover:bg-[#f4f5f7] hover:text-[#0052cc]"
                title="Open job listing"
              >
                <ExternalLinkIcon />
              </a>
            )}
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-[#5e6c84] hover:bg-[#ffebe6] hover:text-[#de350b]"
              title="Delete"
              onClick={onDelete}
            >
              <TrashIcon />
            </button>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-[#5e6c84] hover:bg-[#f4f5f7] hover:text-[#172b4d]"
              aria-label="Close"
              onClick={onClose}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)]">
          <div className="min-h-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
            <input
              id="ext-detail-title"
              className="w-full border-0 bg-transparent text-[22px] font-semibold leading-snug text-[#172b4d] outline-none placeholder:text-[#97a0af] focus:ring-0 sm:text-[26px]"
              value={form.job_title}
              onChange={(e) => setForm((p) => ({ ...p, job_title: e.target.value }))}
              placeholder="Job title"
              required
            />
            {errors.job_title && <p className="mt-1 text-[12px] text-[#de350b]">{errors.job_title.join(', ')}</p>}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dfe1e6] bg-[#f4f5f7] px-2.5 py-1 text-[12px] text-[#42526e]">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sourceColor }} />
                {SOURCES.find((s) => s.value === form.source)?.label || app.source_display || app.source}
              </span>
              {app.applied_ago && (
                <span className="text-[12px] text-[#6b778c]">Applied {app.applied_ago}</span>
              )}
            </div>

            <section className="mt-8">
              <h3 className="text-[14px] font-semibold text-[#172b4d]">Description</h3>
              <textarea
                className="mt-3 min-h-[180px] w-full rounded-2xl border border-[#dfe1e6] bg-[#fafbfc] px-3.5 py-3 text-[14px] leading-relaxed text-[#172b4d] outline-none transition placeholder:text-[#97a0af] focus:border-[#4c9aff] focus:bg-white focus:ring-2 focus:ring-[#4c9aff]/25"
                placeholder="Add notes about this application…"
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              />
            </section>

            <section className="mt-8 rounded-2xl border border-[#ebecf0] bg-[#fafbfc] p-4">
              <h3 className="text-[14px] font-semibold text-[#172b4d]">Role details</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Company *" error={errors.company_name}>
                  <input
                    className="jira-input !rounded-xl"
                    required
                    value={form.company_name}
                    onChange={(e) => setForm((p) => ({ ...p, company_name: e.target.value }))}
                  />
                </Field>
                <Field label="Location" error={errors.location}>
                  <input
                    className="jira-input !rounded-xl"
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  />
                </Field>
                <Field label="Job URL" error={errors.job_url} className="sm:col-span-2">
                  <input
                    className="jira-input !rounded-xl"
                    type="url"
                    placeholder="https://"
                    value={form.job_url}
                    onChange={(e) => setForm((p) => ({ ...p, job_url: e.target.value }))}
                  />
                </Field>
              </div>
            </section>

            <ActivitySection
              applicationId={app.id}
              userInitials={userInitials}
              activityTick={activityTick}
            />
          </div>

          <aside className="min-h-0 overflow-y-auto border-t border-[#ebecf0] bg-[#fafbfc] px-4 py-4 lg:border-l lg:border-t-0 sm:px-5">
            <SelectMenu
              label="Status"
              value={app.status}
              options={STATUSES.map((status) => ({
                value: status,
                label: STATUS_LABELS[status],
              }))}
              onChange={(next) => onStatusChange(next as ExternalApplicationStatus)}
              triggerClassName="!rounded-xl font-semibold"
            />

            <div className="mt-5">
              <h3 className="text-[13px] font-semibold text-[#172b4d]">Details</h3>
              <dl className="mt-3 space-y-3 text-[13px]">
                <DetailRow label="Assignee">
                  <span className="inline-flex items-center gap-2 font-medium text-[#172b4d]">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#ff5630] text-[10px] font-bold text-white">
                      {userInitials}
                    </span>
                    {userName}
                  </span>
                </DetailRow>
                <DetailRow label="Company">
                  <span className="font-medium text-[#172b4d]">{form.company_name || '—'}</span>
                </DetailRow>
                <DetailRow label="Source">
                  <SelectMenu
                    value={form.source}
                    size="sm"
                    options={SOURCES.map((s) => ({ value: s.value, label: s.label }))}
                    onChange={(next) => setForm((p) => ({ ...p, source: next }))}
                    triggerClassName="!rounded-lg"
                  />
                </DetailRow>
                <DetailRow label="Applied on">
                  <DatePicker
                    value={form.applied_at}
                    size="sm"
                    onChange={(next) => setForm((p) => ({ ...p, applied_at: next }))}
                    triggerClassName="!rounded-lg"
                  />
                </DetailRow>
                <DetailRow label="Location">
                  <span className="text-[#172b4d]">{form.location || 'Not set'}</span>
                </DetailRow>
                <DetailRow label="Ticket">
                  <span className="font-medium text-[#172b4d]">EXT-{app.id}</span>
                </DetailRow>
              </dl>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-medium text-[#6b778c] sm:hidden" aria-live="polite">
                {saveState === 'saving' && 'Saving…'}
                {saveState === 'saved' && 'Saved'}
                {saveState === 'error' && 'Couldn’t save'}
              </p>
              <button type="button" className="btn-secondary !rounded-xl" onClick={onClose}>
                Close
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

type DetailFormState = {
  job_title: string
  company_name: string
  job_url: string
  source: string
  location: string
  notes: string
  applied_at: string
}

function formFromApp(app: ExternalApplication): DetailFormState {
  return {
    job_title: app.job_title || '',
    company_name: app.company_name || '',
    job_url: app.job_url || '',
    source: app.source || 'other',
    location: app.location || '',
    notes: stripHtml(app.notes),
    applied_at: app.applied_at ? app.applied_at.slice(0, 10) : '',
  }
}

function serializeForm(form: DetailFormState) {
  return JSON.stringify({
    job_title: form.job_title.trim(),
    company_name: form.company_name.trim(),
    job_url: form.job_url.trim(),
    source: form.source,
    location: form.location.trim(),
    notes: form.notes.trim(),
    applied_at: form.applied_at,
  })
}

function payloadFromForm(form: DetailFormState): ExternalApplicationInput {
  return {
    job_title: form.job_title.trim(),
    company_name: form.company_name.trim(),
    job_url: form.job_url.trim() || undefined,
    source: form.source,
    location: form.location.trim() || undefined,
    notes: form.notes.trim() || undefined,
    applied_at: form.applied_at ? new Date(form.applied_at).toISOString() : undefined,
  }
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[100px_minmax(0,1fr)] items-start gap-2">
      <dt className="pt-1 text-[12px] font-medium text-[#6b778c]">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  )
}

function AddApplicationModal({
  status,
  saving,
  errors,
  onClose,
  onSubmit,
}: {
  status: ExternalApplicationStatus
  saving: boolean
  errors: Record<string, string[]>
  onClose: () => void
  onSubmit: (payload: ExternalApplicationInput) => void
}) {
  const [form, setForm] = useState({
    company_name: '',
    job_title: '',
    job_url: '',
    source: 'other',
    location: '',
    notes: '',
    applied_at: new Date().toISOString().slice(0, 10),
  })

  function submit(e: FormEvent) {
    e.preventDefault()
    onSubmit({
      company_name: form.company_name.trim(),
      job_title: form.job_title.trim(),
      job_url: form.job_url.trim() || undefined,
      source: form.source,
      status,
      location: form.location.trim() || undefined,
      notes: form.notes.trim() || undefined,
      applied_at: form.applied_at ? new Date(form.applied_at).toISOString() : undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-[#091e42]/50 p-4 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-[#dfe1e6] bg-white p-5 shadow-[0_8px_16px_rgba(9,30,66,0.25)] sm:p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-ext-app-title"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#0052cc]">Track application</p>
            <h2 id="add-ext-app-title" className="mt-1 text-xl font-semibold text-[#172b4d]">
              Add to {STATUS_LABELS[status]}
            </h2>
          </div>
          <button type="button" className="btn-secondary !rounded-[3px] !px-3 !py-2" onClick={onClose} disabled={saving}>
            Close
          </button>
        </div>

        <form onSubmit={submit} className="mt-5 grid gap-3 sm:grid-cols-2">
          <Field label="Job title *" error={errors.job_title} className="sm:col-span-2">
            <input
              className="jira-input"
              required
              value={form.job_title}
              onChange={(e) => setForm((p) => ({ ...p, job_title: e.target.value }))}
            />
          </Field>
          <Field label="Company *" error={errors.company_name} className="sm:col-span-2">
            <input
              className="jira-input"
              required
              value={form.company_name}
              onChange={(e) => setForm((p) => ({ ...p, company_name: e.target.value }))}
            />
          </Field>
          <Field label="Source">
            <SelectMenu
              value={form.source}
              options={SOURCES.map((s) => ({ value: s.value, label: s.label }))}
              onChange={(next) => setForm((p) => ({ ...p, source: next }))}
              triggerClassName="!rounded-[3px]"
            />
          </Field>
          <Field label="Applied on">
            <DatePicker
              value={form.applied_at}
              onChange={(next) => setForm((p) => ({ ...p, applied_at: next }))}
              triggerClassName="!rounded-[3px]"
            />
          </Field>
          <Field label="Job URL" className="sm:col-span-2">
            <input
              className="jira-input"
              type="url"
              placeholder="https://"
              value={form.job_url}
              onChange={(e) => setForm((p) => ({ ...p, job_url: e.target.value }))}
            />
          </Field>
          <Field label="Location" className="sm:col-span-2">
            <input
              className="jira-input"
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
            />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <textarea
              className="jira-input min-h-[80px]"
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            />
          </Field>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <button type="button" className="btn-secondary !rounded-[3px]" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary !rounded-[3px]" disabled={saving}>
              {saving ? 'Saving…' : 'Track application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  error,
  className = '',
  children,
}: {
  label: string
  error?: string[]
  className?: string
  children: ReactNode
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[12px] font-semibold text-[#5e6c84]">{label}</span>
      {children}
      {error && <span className="mt-1 block text-[12px] text-[#de350b]">{error.join(', ')}</span>}
    </label>
  )
}
