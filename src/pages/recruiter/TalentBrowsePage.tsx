import { FormEvent, useDeferredValue, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SelectMenu } from '@/components/SelectMenu'
import { api } from '@/lib/api'
import { companyInitial } from '@/lib/format'
import type { TalentProfile } from '@/types'

const EXPERIENCE_OPTIONS = [
  { value: '', label: 'Any experience' },
  { value: '1', label: '1+ years' },
  { value: '3', label: '3+ years' },
  { value: '5', label: '5+ years' },
  { value: '8', label: '8+ years' },
]

export function TalentBrowsePage() {
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [experience, setExperience] = useState('')
  const deferredSearch = useDeferredValue(search)
  const deferredLocation = useDeferredValue(location)
  const [profiles, setProfiles] = useState<TalentProfile[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<number | null>(null)

  useEffect(() => {
    setPage(1)
  }, [deferredSearch, deferredLocation, experience])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api
      .fetchTalentProfiles({
        search: deferredSearch,
        location: deferredLocation,
        experience: experience || undefined,
        page,
      })
      .then((res) => {
        if (cancelled) return
        setProfiles(res.data)
        setTotalPages(res.meta.total_pages)
        setTotalCount(res.meta.total_count)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load talent')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [deferredSearch, deferredLocation, experience, page])

  async function toggleSave(profile: TalentProfile) {
    setSavingId(profile.id)
    try {
      if (profile.saved) {
        await api.unsaveProfile(profile.id)
        setProfiles((prev) => prev.map((p) => (p.id === profile.id ? { ...p, saved: false } : p)))
      } else {
        await api.saveProfile(profile.id)
        setProfiles((prev) => prev.map((p) => (p.id === profile.id ? { ...p, saved: true } : p)))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update saved profile')
    } finally {
      setSavingId(null)
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Talent</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">Browse developers</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Candidates open to recruiter outreach{totalCount ? ` · ${totalCount} profiles` : ''}.
          </p>
        </div>
        <Link to="/saved-profiles" className="btn-secondary cursor-pointer !py-2">
          Saved profiles
        </Link>
      </div>

      <form onSubmit={onSubmit} className="mt-6 grid gap-3 sm:grid-cols-4">
        <input
          className="input-field sm:col-span-2"
          placeholder="Search name, role, skills…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          className="input-field"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <SelectMenu
          value={experience}
          onChange={setExperience}
          options={EXPERIENCE_OPTIONS}
          placeholder="Any experience"
        />
      </form>

      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-white shadow-card" />
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <p className="text-ink-muted">No matching profiles. Try a broader search.</p>
        </div>
      ) : (
        <ul className="mt-8 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => {
            const name = profile.full_name || 'Developer'
            return (
              <li
                key={profile.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition duration-200 hover:border-brand/25 hover:shadow-card-hover"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-bold text-slate-700">
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
                      {[profile.current_role, profile.current_company].filter(Boolean).join(' · ') ||
                        'Rails developer'}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  {[profile.location || [profile.city, profile.country].filter(Boolean).join(', '), profile.experience != null ? `${profile.experience} yrs` : null]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                {!!profile.skills?.length && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {profile.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <Link to={`/talent/${profile.id}`} className="btn-secondary flex-1 cursor-pointer !py-2 text-center">
                    View
                  </Link>
                  <button
                    type="button"
                    disabled={savingId === profile.id}
                    onClick={() => void toggleSave(profile)}
                    className={`cursor-pointer rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                      profile.saved
                        ? 'border-brand bg-brand-soft text-brand'
                        : 'border-slate-200 text-slate-700 hover:border-brand/40'
                    }`}
                  >
                    {profile.saved ? 'Saved' : 'Save'}
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
