import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '@/lib/api'

export function ConfirmEmailPage() {
  const [params] = useSearchParams()
  const token = params.get('confirmation_token') || ''
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Confirming your email…')

  useEffect(() => {
    let cancelled = false

    async function confirm() {
      if (!token) {
        setStatus('error')
        setMessage('Confirmation link is missing a token. Request a new email from sign up.')
        return
      }

      try {
        const res = await api.confirmEmail(token)
        if (cancelled) return
        setStatus('success')
        setMessage(res.message || 'Your email has been confirmed. You can sign in now.')
      } catch (err: unknown) {
        if (cancelled) return
        const e = err as { message?: string }
        setStatus('error')
        setMessage(e.message || 'Confirmation failed. The link may be invalid or expired.')
      }
    }

    void confirm()
    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <div className="container-page flex justify-center py-12 sm:py-16">
      <div className="w-full max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">Email confirmation</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">
          {status === 'loading' && 'Confirming…'}
          {status === 'success' && 'You’re confirmed'}
          {status === 'error' && 'Couldn’t confirm'}
        </h1>
        <p className="mt-3 text-sm text-ink-muted">{message}</p>
        {status !== 'loading' && (
          <div className="mt-8">
            <Link to="/sign-in" className="btn-primary inline-flex">
              {status === 'success' ? 'Sign in' : 'Back to sign in'}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
