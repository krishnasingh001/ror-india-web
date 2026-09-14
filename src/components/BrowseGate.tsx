import { Link, useLocation } from 'react-router-dom'
import { useAuth, useCanBrowseFullCatalog, useIsRecruiter } from '@/context/AuthContext'

type Props = {
  /** What the visitor was trying to open, e.g. "job details" or "more companies". */
  resourceLabel?: string
  /** Compact strip under list pagination vs full-page panel. */
  variant?: 'banner' | 'panel'
}

export function useBrowseGate() {
  const { user, loading } = useAuth()
  const canBrowseFull = useCanBrowseFullCatalog()
  const isRecruiter = useIsRecruiter()
  return { user, loading, canBrowseFull, isRecruiter }
}

function GateActions({ from, needsProfile }: { from: string; needsProfile: boolean }) {
  if (needsProfile) {
    return (
      <Link to="/profile/edit" state={{ from }} className="btn-primary cursor-pointer">
        Create developer profile
      </Link>
    )
  }

  return (
    <>
      <Link to="/sign-in" state={{ from }} className="btn-primary cursor-pointer">
        Sign in
      </Link>
      <Link to="/sign-up" state={{ from }} className="btn-secondary cursor-pointer">
        Create account
      </Link>
    </>
  )
}

function LockIcon() {
  return (
    <svg className="h-6 w-6 text-brand" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 11V8a5 5 0 0 1 10 0v3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <rect
        x="5"
        y="11"
        width="14"
        height="10"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="12" cy="16" r="1.25" fill="currentColor" />
    </svg>
  )
}

export function BrowseGate({ resourceLabel = 'more results', variant = 'banner' }: Props) {
  const { user } = useAuth()
  const location = useLocation()
  const from = `${location.pathname}${location.search}`
  const needsProfile = Boolean(user && !user.has_profile)

  const title = needsProfile
    ? 'Create your developer profile to continue'
    : 'Sign in to continue browsing'
  const body = needsProfile
    ? `You’ve seen the first page. Create your developer profile to view ${resourceLabel} and unlock the full catalog.`
    : `You’ve seen the first page. Sign in and create your developer profile to view ${resourceLabel} and unlock the full catalog.`

  if (variant === 'panel') {
    return (
      <div className="container-page py-16 sm:py-20">
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-card sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            Developer profile required
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">{body}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <GateActions from={from} needsProfile={needsProfile} />
          </div>
          <p className="mt-6 text-sm text-ink-muted">
            <Link to="/" className="font-medium text-brand hover:underline">
              Back to jobs
            </Link>
            {' · '}
            <Link to="/companies" className="font-medium text-brand hover:underline">
              Browse companies
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-10 rounded-2xl border border-brand-border bg-brand-soft/40 px-5 py-6 text-center sm:px-8">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-ink-muted">{body}</p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <GateActions from={from} needsProfile={needsProfile} />
      </div>
    </div>
  )
}

/**
 * Blurs the bottom half of a catalog grid and overlays a lock + sign-in / profile CTA.
 * Top half stays readable as a teaser.
 */
export function LockedCatalog({
  locked,
  resourceLabel = 'job openings',
  children,
}: {
  locked: boolean
  resourceLabel?: string
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const location = useLocation()
  const from = `${location.pathname}${location.search}`
  const needsProfile = Boolean(user && !user.has_profile)

  const title = needsProfile ? 'Create your profile to unlock' : 'Sign in to see job openings'
  const body = needsProfile
    ? `Create your developer profile to unlock the full list of ${resourceLabel}.`
    : `Sign in and create your developer profile to unlock the full list of ${resourceLabel}.`

  if (!locked) return <>{children}</>

  return (
    <div className="relative">
      <div>{children}</div>

      {/* Soft fade into the locked zone */}
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-20 -translate-y-full bg-gradient-to-b from-transparent via-white/10 to-white/25"
        aria-hidden="true"
      />

      {/* Blurred lower half + CTA */}
      <div className="absolute inset-x-0 bottom-0 top-1/2 z-20 flex items-center justify-center px-4 py-6">
        <div
          className="absolute inset-0 bg-white/15 backdrop-blur-[2px]"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 px-5 py-6 text-center shadow-card sm:px-8 sm:py-7">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft">
            <LockIcon />
          </div>
          <h2 className="mt-3 text-lg font-bold tracking-tight text-ink sm:text-xl">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{body}</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <GateActions from={from} needsProfile={needsProfile} />
          </div>
        </div>
      </div>
    </div>
  )
}

/** Blocks job/company detail until the visitor has a developer profile (recruiters exempt). */
export function RequireBrowseAccess({ children }: { children: React.ReactNode }) {
  const { loading, canBrowseFull, isRecruiter } = useBrowseGate()

  if (loading) {
    return (
      <div className="container-page py-20">
        <div className="mx-auto h-40 max-w-lg animate-pulse rounded-2xl bg-white shadow-card" />
      </div>
    )
  }

  if (isRecruiter || canBrowseFull) {
    return <>{children}</>
  }

  return <BrowseGate resourceLabel="full details" variant="panel" />
}
