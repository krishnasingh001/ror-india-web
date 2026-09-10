import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const navClass = ({ isActive }: { isActive: boolean }) =>
  [
    'cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold transition duration-200 ease-out',
    isActive
      ? 'bg-brand-soft text-brand'
      : 'text-slate-600 hover:bg-white/80 hover:text-slate-900',
  ].join(' ')

export function Layout() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  async function onLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex cursor-pointer items-center" aria-label="ROR India home">
            <img
              src="/logo-ror-india.png"
              alt="ROR India"
              className="h-8 w-auto sm:h-9"
              width={160}
              height={44}
            />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/" end className={navClass}>
              Jobs
            </NavLink>
            <NavLink to="/companies" className={navClass}>
              Companies
            </NavLink>
            {user && (
              <>
                <NavLink to="/dashboard" className={navClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/saved-jobs" className={navClass}>
                  Saved
                </NavLink>
                <NavLink to="/applications" className={navClass}>
                  Applications
                </NavLink>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {loading ? (
              <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-200/70" />
            ) : user ? (
              <>
                <span className="hidden max-w-[10rem] truncate text-sm font-medium text-slate-600 lg:inline">
                  {user.name}
                </span>
                <button type="button" onClick={() => void onLogout()} className="btn-secondary !py-2">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/sign-in" className="btn-secondary !py-2">
                  Sign in
                </Link>
                <Link to="/sign-up" className="btn-primary !py-2">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-0 flex-1">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container-page flex flex-col gap-3 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-ror-india.png" alt="" className="h-6 w-auto" />
            <p>© {new Date().getFullYear()} Rails jobs across India.</p>
          </div>
          <div className="flex gap-4">
            <Link to="/sign-in" className="hover:text-brand">
              Sign in
            </Link>
            <Link to="/sign-up" className="hover:text-brand">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
