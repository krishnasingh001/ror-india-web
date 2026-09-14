import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, useIsRecruiter } from '@/context/AuthContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="container-page py-20">
        <div className="mx-auto h-40 max-w-lg animate-pulse rounded-2xl bg-white shadow-card" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}

export function RecruiterRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const isRecruiter = useIsRecruiter()
  const location = useLocation()

  if (loading) {
    return (
      <div className="container-page py-20">
        <div className="mx-auto h-40 max-w-lg animate-pulse rounded-2xl bg-white shadow-card" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />
  }

  if (!isRecruiter) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

/** Candidate-only surfaces: recruiters are sent to the hiring dashboard. */
export function CandidateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const isRecruiter = useIsRecruiter()
  const location = useLocation()

  if (loading) {
    return (
      <div className="container-page py-20">
        <div className="mx-auto h-40 max-w-lg animate-pulse rounded-2xl bg-white shadow-card" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />
  }

  if (isRecruiter) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
