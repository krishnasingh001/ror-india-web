import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { createPortal } from 'react-dom'

export type SelectOption = {
  value: string
  label: string
}

type SelectMenuProps = {
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  className?: string
  triggerClassName?: string
  size?: 'sm' | 'md'
  disabled?: boolean
}

function menuPositionFor(trigger: HTMLElement): CSSProperties {
  const rect = trigger.getBoundingClientRect()
  const width = Math.max(rect.width, 180)
  const spaceBelow = window.innerHeight - rect.bottom
  const openUp = spaceBelow < 240 && rect.top > spaceBelow
  return {
    position: 'fixed',
    left: Math.min(rect.left, window.innerWidth - width - 8),
    width,
    zIndex: 320,
    ...(openUp
      ? { bottom: window.innerHeight - rect.top + 6, top: 'auto' }
      : { top: rect.bottom + 6, bottom: 'auto' }),
  }
}

export function SelectMenu({
  value,
  options,
  onChange,
  label,
  placeholder = 'Select…',
  className = '',
  triggerClassName = '',
  size = 'md',
  disabled = false,
}: SelectMenuProps) {
  const id = useId()
  const listId = `${id}-listbox`
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [menuStyle, setMenuStyle] = useState<CSSProperties | null>(null)

  const selected = options.find((o) => o.value === value)
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  )

  function openMenu() {
    if (disabled) return
    const trigger = triggerRef.current
    if (!trigger) return
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
    setMenuStyle(menuPositionFor(trigger))
    setOpen(true)
  }

  function closeMenu(returnFocus = false) {
    setOpen(false)
    setMenuStyle(null)
    if (returnFocus) triggerRef.current?.focus({ preventScroll: true })
  }

  useLayoutEffect(() => {
    if (!open || !menuStyle) return
    listRef.current?.focus({ preventScroll: true })
  }, [open, menuStyle])

  useEffect(() => {
    if (!open) return

    function place() {
      const el = triggerRef.current
      if (!el) return
      setMenuStyle(menuPositionFor(el))
    }

    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node
      if (rootRef.current?.contains(target)) return
      if (listRef.current?.contains(target)) return
      closeMenu()
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeMenu(true)
      }
    }

    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function choose(next: string) {
    onChange(next)
    closeMenu(true)
  }

  function onTriggerKeyDown(e: ReactKeyboardEvent<HTMLButtonElement>) {
    if (disabled) return
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openMenu()
    }
  }

  function onListKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(options.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(0, i - 1))
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActiveIndex(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setActiveIndex(options.length - 1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const opt = options[activeIndex]
      if (opt) choose(opt.value)
    }
  }

  const pad = size === 'sm' ? 'px-3 py-2 text-sm' : 'px-4 py-3 text-sm'

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          if (disabled) return
          if (open) closeMenu()
          else openMenu()
        }}
        onKeyDown={onTriggerKeyDown}
        className={`inline-flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-slate-300 bg-white text-left font-medium text-ink outline-none transition duration-200 ease-out hover:border-slate-400 hover:bg-slate-50 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/15 disabled:cursor-not-allowed disabled:opacity-60 ${pad} ${triggerClassName}`}
      >
        <span className={selected ? 'truncate' : 'truncate text-ink-soft'}>
          {selected?.label || placeholder}
        </span>
        <ChevronIcon open={open} />
      </button>

      {open &&
        menuStyle &&
        createPortal(
          <div
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-labelledby={id}
            style={menuStyle}
            onKeyDown={onListKeyDown}
            onMouseDown={(e) => e.preventDefault()}
            className="max-h-64 overflow-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-panel outline-none"
          >
            {options.map((opt, index) => {
              const isSelected = opt.value === value
              const isActive = index === activeIndex
              return (
                <button
                  key={`${opt.value}-${opt.label}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(opt.value)}
                  className={`flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition duration-150 ease-out ${
                    isSelected
                      ? 'bg-brand-soft text-brand'
                      : isActive
                        ? 'bg-slate-100 text-ink'
                        : 'text-ink hover:bg-slate-50'
                  }`}
                >
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
                    {isSelected && <CheckIcon />}
                  </span>
                  <span className="truncate">{opt.label}</span>
                </button>
              )
            })}
          </div>,
          document.body,
        )}
    </div>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-ink-muted transition duration-200 ease-out ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path strokeLinecap="round" d="m6 9 6 6 6-6" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}
