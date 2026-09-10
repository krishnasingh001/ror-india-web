import { FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function SignInPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from || '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await login(email, password)
      navigate(from !== '/sign-in' ? from : res.redirect_to || '/dashboard')
    } catch (err: unknown) {
      const e2 = err as { message?: string }
      setError(e2.message || 'Sign in failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container-page flex justify-center py-12 sm:py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">Welcome back</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">Sign in to ROR India</h1>
          <p className="mt-2 text-sm text-ink-muted">Access saved jobs, applications, and your dashboard.</p>
        </div>
        <form onSubmit={onSubmit} className="card-surface space-y-4 p-6 shadow-panel sm:p-8">
          {error && <div className="rounded-xl border border-red-200 bg-brand-soft px-3 py-2 text-sm text-brand" role="alert">{error}</div>}
          <div>
            <label htmlFor="email" className="label-field">Email</label>
            <input id="email" type="email" autoComplete="email" required className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="password" className="label-field">Password</label>
            <input id="password" type="password" autoComplete="current-password" required className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-muted">
          New here? <Link to="/sign-up" className="font-semibold text-brand hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  )
}
