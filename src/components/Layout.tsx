import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const navClass = ({ isActive }: { isActive: boolean }) =>
  [
    'cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold transition duration-200 ease-out',
    isActive ? 'bg-brand-soft text-brand' : 'text-ink-muted hover:bg-surface-muted hover:text-ink',
  ].join(' ')

export function Layout() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  async function onLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex cursor-pointer items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white">R</span>
            <span className="text-lg font-bold tracking-tight text-ink">ROR India</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/" end className={navClass}>Jobs</NavLink>
            <NavLink to="/companies" className={navClass}>Companies</NavLink>
            {user && (
              <>
                <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
                <NavLink to="/saved-jobs" className={navClass}>Saved</NavLink>
                <NavLink to="/applications" className={navClass}>Applications</NavLink>
              </>
            )}
          </nav>
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="h-9 w-24 animate-pulse rounded-xl bg-surface-muted" />
            ) : user ? (
              <>
                <span className="hidden max-w-[10rem] truncate text-sm font-medium text-ink-muted lg:inline">{user.name}</span>
                <button type="button" onClick={() => void onLogout()} className="btn-secondary !py-2">Sign out</button>
              </>
            ) : (
              <>
                <Link to="/sign-in" className="btn-secondary !py-2">Sign in</Link>
                <Link to="/sign-up" className="btn-primary !py-2">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="container-page flex flex-col gap-2 py-8 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ROR India — Rails jobs across India.</p>
          <div className="flex gap-4">
            <Link to="/sign-in" className="hover:text-brand">Sign in</Link>
            <Link to="/sign-up" className="hover:text-brand">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
