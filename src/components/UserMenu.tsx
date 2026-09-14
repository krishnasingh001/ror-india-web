import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, useIsRecruiter } from '@/context/AuthContext'
import { companyInitial } from '@/lib/format'

const RAILS_ORIGIN = import.meta.env.VITE_RAILS_URL?.replace(/\/$/, '') || 'http://localhost:3000'

function MenuIcon({ children }: { children: ReactNode }) {
  return <span className="text-brand/80">{children}</span>
}

type MenuItem = {
  label: string
  to?: string
  href?: string
  icon: ReactNode
}

export function UserMenu() {
  const { user, logout } = useAuth()
  const isRecruiter = useIsRecruiter()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  if (!user) return null

  const initial = companyInitial(user.name)

  async function onLogout() {
    setOpen(false)
    await logout()
    navigate('/')
  }

  const recruiterItems: MenuItem[] = [
    {
      label: 'Dashboard',
      to: '/dashboard',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
        </svg>
      ),
    },
    {
      label: 'Post a job',
      to: '/jobs/new',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" d="M12 5v14M5 12h14" />
        </svg>
      ),
    },
    {
      label: 'Add company',
      to: '/companies/new',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14 9h5a1 1 0 0 1 1 1v11M12 9v4M10 11h4" />
        </svg>
      ),
    },
    {
      label: 'My profile',
      to: '/recruiter/profile',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" d="M20 21a8 8 0 0 0-16 0" />
          <circle cx="12" cy="8" r="4" />
        </svg>
      ),
    },
    {
      label: 'My jobs',
      to: '/my-jobs',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M4 7h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" />
        </svg>
      ),
    },
    {
      label: 'Track applications',
      to: '/recruiter/applications',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" d="M8 7h8M8 12h8M8 17h5M6 3h12a1 1 0 0 1 1 1v16l-4-2-4 2-4-2-4 2V4a1 1 0 0 1 1-1Z" />
        </svg>
      ),
    },
    {
      label: 'Browse talent',
      to: '/talent',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="9.5" cy="7" r="3.5" />
          <path strokeLinecap="round" d="M19 8a3 3 0 0 1 0 6" />
        </svg>
      ),
    },
    {
      label: 'Saved profiles',
      to: '/saved-profiles',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12v17l-6-3.5L6 21V4Z" />
        </svg>
      ),
    },
  ]

  const candidateItems: MenuItem[] = [
    {
      label: 'Dashboard',
      to: '/dashboard',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
        </svg>
      ),
    },
    {
      label: 'Team Standup',
      href: `${RAILS_ORIGIN}/standup`,
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M17 11a4 4 0 1 0 0-8M21 21v-2a4 4 0 0 0-3-3.87" />
          <circle cx="9.5" cy="7" r="4" />
        </svg>
      ),
    },
    {
      label: 'Track Applications',
      to: '/track-applications',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" d="M8 7h8M8 12h8M8 17h5M6 3h12a1 1 0 0 1 1 1v16l-4-2-4 2-4-2-4 2V4a1 1 0 0 1 1-1Z" />
        </svg>
      ),
    },
    {
      label: 'Saved Jobs',
      to: '/saved-jobs',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12v17l-6-3.5L6 21V4Z" />
        </svg>
      ),
    },
    {
      label: 'My Blog Posts',
      to: '/my-blog-posts',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path strokeLinecap="round" d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
          <path strokeLinecap="round" d="M8 7h8M8 11h8M8 15h5" />
        </svg>
      ),
    },
  ]

  const primaryItems = isRecruiter ? recruiterItems : candidateItems

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-white py-1 pl-1 pr-3 text-sm font-semibold text-ink transition duration-200 hover:border-brand-border hover:bg-brand-soft/40"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-xs font-bold text-slate-700">
          {user.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : initial}
        </span>
        <span className="hidden sm:inline">{isRecruiter ? 'Hiring' : 'Me'}</span>
        <svg
          className={`h-3.5 w-3.5 text-slate-500 transition duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-[60] mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-panel"
        >
          {isRecruiter && (
            <div className="border-b border-slate-100 px-4 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand">Recruiter account</p>
              <p className="truncate text-sm font-medium text-ink">{user.name || user.email}</p>
            </div>
          )}

          {primaryItems.map((item) =>
            item.href ? (
              <a
                key={item.label}
                href={item.href}
                role="menuitem"
                className="flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium text-ink transition duration-200 hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                <span>{item.label}</span>
                <MenuIcon>{item.icon}</MenuIcon>
              </a>
            ) : (
              <Link
                key={item.label}
                to={item.to!}
                role="menuitem"
                className="flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium text-ink transition duration-200 hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                <span>{item.label}</span>
                <MenuIcon>{item.icon}</MenuIcon>
              </Link>
            ),
          )}

          <div className="my-1 border-t border-slate-200" />

          {!isRecruiter && (
            <Link
              to="/profile"
              role="menuitem"
              className="flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium text-ink transition duration-200 hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              <span>Profile</span>
              <MenuIcon>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" d="M20 21a8 8 0 0 0-16 0" />
                  <circle cx="12" cy="8" r="4" />
                </svg>
              </MenuIcon>
            </Link>
          )}

          <button
            type="button"
            role="menuitem"
            className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-left text-sm font-medium text-ink transition duration-200 hover:bg-slate-50"
            onClick={() => void onLogout()}
          >
            <span>Logout</span>
            <MenuIcon>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" d="M10 17H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h5M14 12h8M18 8l4 4-4 4" />
              </svg>
            </MenuIcon>
          </button>
        </div>
      )}
    </div>
  )
}
