import { Link, NavLink, Outlet } from 'react-router-dom'
import { AtmosphereBackground } from '@/components/AtmosphereBackground'
import { BrandLogo } from '@/components/BrandLogo'
import { SiteFooter } from '@/components/SiteFooter'
import { UserMenu } from '@/components/UserMenu'
import { useAuth } from '@/context/AuthContext'

const navClass = ({ isActive }: { isActive: boolean }) =>
  [
    'cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold transition duration-200 ease-out',
    isActive
      ? 'bg-brand-soft text-brand'
      : 'text-slate-600 hover:bg-white/80 hover:text-slate-900',
  ].join(' ')

export function Layout() {
  const { user, loading } = useAuth()

  return (
    <div className="atmosphere app-shell">
      <AtmosphereBackground />
      <header className="site-header">
        <div className="container-page flex h-[4.25rem] items-center justify-between gap-4 sm:h-[4.5rem]">
          <Link to="/" className="flex shrink-0 cursor-pointer items-center" aria-label="ROR World home">
            <BrandLogo />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/" end className={navClass}>
              Jobs
            </NavLink>
            <NavLink to="/companies" className={navClass}>
              Companies
            </NavLink>
            <NavLink to="/blog" className={navClass}>
              Blog
            </NavLink>
            {user && (
              <NavLink to="/dashboard" className={navClass}>
                Dashboard
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {loading ? (
              <div className="h-9 w-24 animate-pulse rounded-full bg-slate-200/70" />
            ) : user ? (
              <UserMenu />
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
