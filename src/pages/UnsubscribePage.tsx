import { FormEvent, useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { api } from '@/lib/api'

export function UnsubscribePage() {
  const { token: pathToken } = useParams()
  const [params] = useSearchParams()
  const token = pathToken || params.get('token') || ''
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    token ? 'loading' : 'idle',
  )
  const [message, setMessage] = useState(
    token
      ? 'Unsubscribing you from weekly job alerts…'
      : 'Enter your email to unsubscribe from weekly alerts.',
  )

  useEffect(() => {
    if (!token) return
    let cancelled = false

    async function run() {
      try {
        const res = await api.unsubscribe({ token })
        if (cancelled) return
        setStatus('success')
        setMessage(res.message)
      } catch (err: unknown) {
        if (cancelled) return
        const e = err as { message?: string }
        setStatus('error')
        setMessage(e.message || 'Could not unsubscribe. The link may be invalid.')
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [token])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMessage('Looking up your subscription…')
    try {
      const res = await api.unsubscribe({ email })
      setStatus('success')
      setMessage(res.message)
    } catch (err: unknown) {
      const e2 = err as { message?: string }
      setStatus('error')
      setMessage(e2.message || 'Could not unsubscribe')
    }
  }

  return (
    <div className="container-page flex justify-center py-12 sm:py-16">
      <div className="w-full max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">Email preferences</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">
          {status === 'success' ? 'Unsubscribed' : 'Unsubscribe'}
        </h1>
        <p className="mt-3 text-sm text-ink-muted">{message}</p>

        {!token && status !== 'success' && (
          <form onSubmit={onSubmit} className="card-surface mt-8 space-y-4 p-6 text-left shadow-panel sm:p-8">
            <div>
              <label htmlFor="email" className="label-field">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">
              {status === 'loading' ? 'Working…' : 'Unsubscribe'}
            </button>
          </form>
        )}

        <div className="mt-8">
          <Link to="/" className="btn-primary inline-flex">
            Back to jobs
          </Link>
        </div>
      </div>
    </div>
  )
}
