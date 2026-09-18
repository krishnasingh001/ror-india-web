import { FormEvent, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '@/lib/api'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('reset_password_token') || ''
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!token) {
      setError('Reset link is missing a token. Request a new password reset email.')
      return
    }
    if (password !== passwordConfirmation) {
      setError('Passwords do not match.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await api.updatePassword({
        reset_password_token: token,
        password,
        password_confirmation: passwordConfirmation,
      })
      navigate('/sign-in?reset=1')
    } catch (err: unknown) {
      const e2 = err as { message?: string; payload?: { errors?: string[] } }
      setError(e2.payload?.errors?.join(', ') || e2.message || 'Could not reset password')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container-page flex justify-center py-12 sm:py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">Account recovery</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">Choose a new password</h1>
          <p className="mt-2 text-sm text-ink-muted">Enter a new password for your ROR World account.</p>
        </div>
        <form onSubmit={onSubmit} className="card-surface space-y-4 p-6 shadow-panel sm:p-8">
          {!token && (
            <div className="rounded-xl border border-red-200 bg-brand-soft px-3 py-2 text-sm text-brand" role="alert">
              This reset link is incomplete. Please request a new one from the forgot password page.
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-200 bg-brand-soft px-3 py-2 text-sm text-brand" role="alert">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="password" className="label-field">New password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password_confirmation" className="label-field">Confirm password</label>
            <input
              id="password_confirmation"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              className="input-field"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
            />
          </div>
          <button type="submit" disabled={busy || !token} className="btn-primary w-full">
            {busy ? 'Updating…' : 'Update password'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-muted">
          <Link to="/forgot-password" className="font-semibold text-brand hover:underline">
            Request a new link
          </Link>
        </p>
      </div>
    </div>
  )
}
