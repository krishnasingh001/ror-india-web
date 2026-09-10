import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function SignUpPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [role, setRole] = useState('candidate')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role,
      })
      setMessage(res.message)
      if (res.requires_confirmation) {
        setTimeout(() => navigate('/sign-in'), 1800)
      }
    } catch (err: unknown) {
      const e2 = err as { message?: string; payload?: { errors?: string[] } }
      setError(e2.payload?.errors?.join(', ') || e2.message || 'Sign up failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container-page flex justify-center py-12 sm:py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">Get started</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">Create your account</h1>
          <p className="mt-2 text-sm text-ink-muted">Join as a candidate or recruiter in under a minute.</p>
        </div>
        <form onSubmit={onSubmit} className="card-surface space-y-4 p-6 shadow-panel sm:p-8">
          {error && <div className="rounded-xl border border-red-200 bg-brand-soft px-3 py-2 text-sm text-brand" role="alert">{error}</div>}
          {message && <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800" role="status">{message}</div>}
          <div>
            <label htmlFor="name" className="label-field">Full name</label>
            <input id="name" required className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label htmlFor="email" className="label-field">Email</label>
            <input id="email" type="email" autoComplete="email" required className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <fieldset>
            <legend className="label-field">I am a</legend>
            <div className="grid grid-cols-2 gap-2">
              {(['candidate', 'recruiter'] as const).map((r) => (
                <label key={r} className={`flex cursor-pointer items-center justify-center rounded-xl border px-3 py-3 text-sm font-semibold transition duration-200 ${role === r ? 'border-brand bg-brand-soft text-brand' : 'border-slate-200 bg-white text-ink-muted hover:bg-surface-muted'}`}>
                  <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} className="sr-only" />
                  {r === 'candidate' ? 'Candidate' : 'Recruiter'}
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="password" className="label-field">Password</label>
            <input id="password" type="password" autoComplete="new-password" required minLength={6} className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <label htmlFor="password_confirmation" className="label-field">Confirm password</label>
            <input id="password_confirmation" type="password" autoComplete="new-password" required minLength={6} className="input-field" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} />
          </div>
          <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? 'Creating…' : 'Create account'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account? <Link to="/sign-in" className="font-semibold text-brand hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
