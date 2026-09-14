import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, useIsRecruiter } from '@/context/AuthContext'
import { ExternalApplicationsPage } from '@/pages/ExternalApplicationsPage'

/** Candidates get the personal tracker; recruiters get the hiring pipeline board. */
export function TrackApplicationsRouter() {
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
    return <Navigate to="/recruiter/applications" replace />
  }

  return <ExternalApplicationsPage />
}
