import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

type Props = {
  kind: 'job' | 'company'
}

export function AddCatalogCard({ kind }: Props) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const href = kind === 'job' ? '/jobs/new' : '/companies/new'
  const label = kind === 'job' ? 'Post a job' : 'Add a company'
  const hint = kind === 'job' ? 'Share an open Rails role' : 'List your company on ROR World'

  function onClick() {
    if (!user) {
      navigate('/sign-in', { state: { from: href } })
      return
    }
    navigate(href)
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full min-h-[11.5rem] w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center transition-colors duration-200 ease-out hover:border-brand hover:bg-brand-soft/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-slate-300 bg-slate-50 text-2xl font-light leading-none text-slate-500 transition-colors duration-200 group-hover:border-brand group-hover:bg-white group-hover:text-brand">
        +
      </span>
      <span className="mt-3 text-sm font-semibold text-ink">{label}</span>
      <span className="mt-1 text-xs text-ink-muted">{hint}</span>
      {!user && (
        <span className="mt-3 text-[11px] font-medium text-brand">Sign in required</span>
      )}
    </button>
  )
}
