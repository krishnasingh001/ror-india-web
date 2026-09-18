import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, clearCsrf, ensureCsrf } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

export function ImpersonatePage() {
  const { token = '' } = useParams()
  const navigate = useNavigate()
  const { applySession } = useAuth()
  const [message, setMessage] = useState('Signing you in…')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      if (!token) {
        setError('Impersonation link is missing a token.')
        return
      }

      try {
        clearCsrf()
        await ensureCsrf(true)
        const res = await api.impersonate(token)
        if (cancelled) return

        if (!res.user) {
          setError('Impersonation succeeded but no user was returned.')
          return
        }

        await applySession(res.user, res.auth_token)
        if (cancelled) return

        // Confirm the session works for subsequent API calls (profile, dashboard, …).
        const me = await api.me()
        if (cancelled) return
        if (!me.user) {
          setError(
            'Signed in on the server, but this browser blocked the session. Try a normal window (not Incognito), or allow cookies for rorindia.com.',
          )
          return
        }

        setMessage(res.message || 'Signed in. Redirecting…')
        navigate(res.redirect_to || '/dashboard', { replace: true })
      } catch (err: unknown) {
        if (cancelled) return
        const e = err as { message?: string }
        setError(e.message || 'Could not complete impersonation. The link may be invalid or expired.')
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [token, navigate, applySession])

  return (
    <div className="container-page flex justify-center py-12 sm:py-16">
      <div className="w-full max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">Admin login-as</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">
          {error ? 'Couldn’t sign in' : 'Signing in…'}
        </h1>
        <p className="mt-3 text-sm text-ink-muted">{error || message}</p>
        {error && (
          <div className="mt-8">
            <Link to="/sign-in" className="btn-primary inline-flex">
              Back to sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
