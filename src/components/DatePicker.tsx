import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type DatePickerProps = {
  value: string
  onChange: (value: string) => void
  label?: string
  className?: string
  triggerClassName?: string
  size?: 'sm' | 'md'
  disabled?: boolean
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function parseYmd(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null
  return date
}

function toYmd(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDisplay(value: string) {
  const date = parseYmd(value)
  if (!date) return 'Pick a date'
  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function DatePicker({
  value,
  onChange,
  label,
  className = '',
  triggerClassName = '',
  size = 'md',
  disabled = false,
}: DatePickerProps) {
  const id = useId()
  const panelId = `${id}-panel`
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({})
  const selected = parseYmd(value)
  const [view, setView] = useState(() => startOfMonth(selected || new Date()))

  useEffect(() => {
    const next = parseYmd(value)
    if (next) setView(startOfMonth(next))
  }, [value])

  useEffect(() => {
    if (!open) return

    function place() {
      const el = triggerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const width = 288
      const spaceBelow = window.innerHeight - rect.bottom
      const openUp = spaceBelow < 340 && rect.top > spaceBelow
      setMenuStyle({
        position: 'fixed',
        left: Math.min(rect.left, window.innerWidth - width - 8),
        width,
        zIndex: 320,
        ...(openUp
          ? { bottom: window.innerHeight - rect.top + 6 }
          : { top: rect.bottom + 6 }),
      })
    }

    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node
      if (rootRef.current?.contains(target)) return
      const panel = document.getElementById(panelId)
      if (panel?.contains(target)) return
      setOpen(false)
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        triggerRef.current?.focus({ preventScroll: true })
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, panelId])

  const days = useMemo(() => {
    const first = startOfMonth(view)
    const startWeekday = first.getDay()
    const gridStart = new Date(first)
    gridStart.setDate(first.getDate() - startWeekday)
    return Array.from({ length: 42 }, (_, i) => {
      const day = new Date(gridStart)
      day.setDate(gridStart.getDate() + i)
      return day
    })
  }, [view])

  const today = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }, [])

  function pick(day: Date) {
    onChange(toYmd(day))
    setOpen(false)
    triggerRef.current?.focus({ preventScroll: true })
  }

  function clear() {
    onChange('')
    setOpen(false)
    triggerRef.current?.focus({ preventScroll: true })
  }

  const pad = size === 'sm' ? 'px-2.5 py-1.5 text-[13px]' : 'px-3 py-2 text-[13px]'

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-[#6b778c]">
          {label}
        </label>
      )}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`inline-flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-[#dfe1e6] bg-white text-left font-medium outline-none transition duration-200 ease-out hover:border-[#c1c7d0] hover:bg-[#fafbfc] focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-60 ${pad} ${
          selected ? 'text-[#172b4d]' : 'text-[#97a0af]'
        } ${triggerClassName}`}
      >
        <span className="truncate">{formatDisplay(value)}</span>
        <CalendarIcon />
      </button>

      {open &&
        createPortal(
          <div
            id={panelId}
            role="dialog"
            aria-label="Choose date"
            style={menuStyle}
            className="rounded-2xl border border-[#dfe1e6] bg-white p-3 shadow-[0_12px_32px_rgba(9,30,66,0.18)] outline-none"
          >
            <div className="flex items-center justify-between gap-2 px-1">
              <p className="text-[13px] font-semibold text-[#172b4d]">
                {MONTHS[view.getMonth()]} {view.getFullYear()}
              </p>
              <div className="flex items-center gap-1">
                <IconButton
                  label="Previous month"
                  onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
                >
                  <ChevronLeftIcon />
                </IconButton>
                <IconButton
                  label="Next month"
                  onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
                >
                  <ChevronRightIcon />
                </IconButton>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((day, i) => (
                <span key={`${day}-${i}`} className="py-1 text-center text-[11px] font-semibold text-[#6b778c]">
                  {day}
                </span>
              ))}
              {days.map((day) => {
                const inMonth = day.getMonth() === view.getMonth()
                const isSelected = selected ? sameDay(day, selected) : false
                const isToday = sameDay(day, today)
                return (
                  <button
                    key={toYmd(day)}
                    type="button"
                    onClick={() => pick(day)}
                    className={`inline-flex h-9 w-full cursor-pointer items-center justify-center rounded-xl text-[13px] font-medium transition duration-150 ease-out ${
                      isSelected
                        ? 'bg-brand text-white shadow-sm'
                        : isToday
                          ? 'bg-brand-soft text-brand ring-1 ring-brand/30'
                          : inMonth
                            ? 'text-[#172b4d] hover:bg-[#f4f5f7]'
                            : 'text-[#97a0af] hover:bg-[#f4f5f7]'
                    }`}
                  >
                    {day.getDate()}
                  </button>
                )
              })}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-[#ebecf0] pt-2.5">
              <button
                type="button"
                onClick={clear}
                className="cursor-pointer rounded-lg px-2 py-1 text-[12px] font-semibold text-[#5e6c84] transition duration-150 hover:bg-[#f4f5f7] hover:text-[#172b4d]"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => pick(today)}
                className="cursor-pointer rounded-lg px-2 py-1 text-[12px] font-semibold text-brand transition duration-150 hover:bg-brand-soft"
              >
                Today
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-[#5e6c84] transition duration-150 ease-out hover:bg-[#f4f5f7] hover:text-[#172b4d]"
    >
      {children}
    </button>
  )
}

function CalendarIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0 text-[#6b778c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path strokeLinecap="round" d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" d="m15 18-6-6 6-6" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" d="m9 18 6-6-6-6" />
    </svg>
  )
}
