import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const RAILS_ORIGIN = import.meta.env.VITE_RAILS_URL?.replace(/\/$/, '') || 'http://localhost:3000'

/**
 * ActiveAdmin lives on the Rails app. Send /admin* there with a full navigation
 * so admin assets/session cookies work on the Rails origin.
 */
export function AdminRedirect() {
  const location = useLocation()

  useEffect(() => {
    const target = `${RAILS_ORIGIN}${location.pathname}${location.search}${location.hash}`
    window.location.replace(target)
  }, [location.pathname, location.search, location.hash])

  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4 text-sm text-ink-muted">
      Redirecting to ActiveAdmin…
    </div>
  )
}
