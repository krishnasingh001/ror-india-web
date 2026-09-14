import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { companyInitial } from '@/lib/format'
import type { TalentProfile } from '@/types'

export function SavedProfilesPage() {
  const [profiles, setProfiles] = useState<TalentProfile[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api
      .fetchSavedProfiles(page)
      .then((res) => {
        if (cancelled) return
        setProfiles(res.data)
        setTotalPages(res.meta.total_pages)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load saved profiles')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [page])

  async function onRemove(profile: TalentProfile) {
    setRemovingId(profile.id)
    try {
      await api.unsaveProfile(profile.id)
      setProfiles((prev) => prev.filter((p) => p.id !== profile.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove profile')
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Talent</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">Saved profiles</h1>
          <p className="mt-1 text-sm text-ink-muted">Candidates you’ve bookmarked for outreach.</p>
        </div>
        <Link to="/talent" className="btn-primary cursor-pointer">
          Browse talent
        </Link>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="mt-8 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-white shadow-card" />
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <p className="text-ink-muted">No saved profiles yet.</p>
          <Link to="/talent" className="btn-primary mt-4 inline-flex cursor-pointer">
            Find talent
          </Link>
        </div>
      ) : (
        <ul className="mt-8 list-none space-y-3 p-0">
          {profiles.map((profile) => {
            const name = profile.full_name || 'Developer'
            return (
              <li
                key={profile.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                  {profile.profile_picture_url ? (
                    <img src={profile.profile_picture_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    companyInitial(name)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link to={`/talent/${profile.id}`} className="font-bold text-ink hover:text-brand">
                    {name}
                  </Link>
                  <p className="truncate text-sm text-ink-muted">
                    {[profile.current_role, profile.current_company, profile.location].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link to={`/talent/${profile.id}`} className="btn-secondary cursor-pointer !py-2">
                    View
                  </Link>
                  <button
                    type="button"
                    disabled={removingId === profile.id}
                    onClick={() => void onRemove(profile)}
                    className="cursor-pointer rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            className="btn-secondary cursor-pointer !py-2 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span className="flex items-center px-3 text-sm text-ink-muted">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            className="btn-secondary cursor-pointer !py-2 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
