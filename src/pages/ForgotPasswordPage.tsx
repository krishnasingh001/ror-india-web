import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await api.requestPasswordReset(email)
      setMessage(res.message)
    } catch (err: unknown) {
      const e2 = err as { message?: string }
      setError(e2.message || 'Could not send reset email')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container-page flex justify-center py-12 sm:py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">Account recovery</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">Forgot password?</h1>
          <p className="mt-2 text-sm text-ink-muted">We’ll email you a link to choose a new password.</p>
        </div>
        <form onSubmit={onSubmit} className="card-surface space-y-4 p-6 shadow-panel sm:p-8">
          {message && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
              {message}
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-200 bg-brand-soft px-3 py-2 text-sm text-brand" role="alert">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="label-field">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-muted">
          Remembered it?{' '}
          <Link to="/sign-in" className="font-semibold text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
