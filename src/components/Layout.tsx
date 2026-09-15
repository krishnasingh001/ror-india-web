import { Link, NavLink, Outlet } from 'react-router-dom'
import { AtmosphereBackground } from '@/components/AtmosphereBackground'
import { BrandLogo } from '@/components/BrandLogo'
import { SiteFooter } from '@/components/SiteFooter'
import { UserMenu } from '@/components/UserMenu'
import { useAuth, useIsRecruiter } from '@/context/AuthContext'

const navClass = ({ isActive }: { isActive: boolean }) =>
  [
    'cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold transition duration-200 ease-out',
    isActive
      ? 'bg-brand-soft text-brand'
      : 'text-slate-600 hover:bg-white/80 hover:text-slate-900',
  ].join(' ')

export function Layout() {
  const { user, loading } = useAuth()
  const isRecruiter = useIsRecruiter()

  return (
    <div className="atmosphere app-shell">
      <AtmosphereBackground />
      <header className="site-header">
        <div className="container-page flex h-[4.25rem] items-center justify-between gap-4 sm:h-[4.5rem]">
          <Link
            to={isRecruiter ? '/dashboard' : '/'}
            className="flex shrink-0 cursor-pointer items-center"
            aria-label="ROR World home"
          >
            <BrandLogo />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {isRecruiter ? (
              <>
                <NavLink to="/dashboard" className={navClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/my-jobs" className={navClass}>
                  My jobs
                </NavLink>
                <NavLink to="/recruiter/applications" className={navClass}>
                  Track applications
                </NavLink>
                <NavLink to="/companies" className={navClass}>
                  Companies
                </NavLink>
                <NavLink to="/talent" className={navClass}>
                  Talent
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/" end className={navClass}>
                  Jobs
                </NavLink>
                <NavLink to="/companies" className={navClass}>
                  Companies
                </NavLink>
                <NavLink to="/tools/ats-resume-checker" className={navClass}>
                  ATS Checker
                </NavLink>
                <NavLink to="/blog" className={navClass}>
                  Blog
                </NavLink>
                {user && (
                  <NavLink to="/dashboard" className={navClass}>
                    Dashboard
                  </NavLink>
                )}
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {loading ? (
              <div className="h-9 w-24 animate-pulse rounded-full bg-slate-200/70" />
            ) : user ? (
              <>
                {isRecruiter && (
                  <>
                    <Link to="/companies/new" className="btn-secondary hidden !py-2 md:inline-flex">
                      Add company
                    </Link>
                    <Link to="/jobs/new" className="btn-primary hidden !py-2 sm:inline-flex">
                      Post a job
                    </Link>
                  </>
                )}
                <UserMenu />
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

      <SiteFooter />
    </div>
  )
}
