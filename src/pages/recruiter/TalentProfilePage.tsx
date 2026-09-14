import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '@/lib/api'
import { companyInitial } from '@/lib/format'
import type { TalentProfile } from '@/types'

export function TalentProfilePage() {
  const { id } = useParams()
  const [profile, setProfile] = useState<TalentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    api
      .fetchTalentProfile(id)
      .then((res) => {
        if (!cancelled) setProfile(res.data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Profile not found')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  async function toggleSave() {
    if (!profile) return
    setSaving(true)
    try {
      if (profile.saved) {
        await api.unsaveProfile(profile.id)
        setProfile({ ...profile, saved: false })
      } else {
        await api.saveProfile(profile.id)
        setProfile({ ...profile, saved: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update saved profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto h-72 max-w-3xl animate-pulse rounded-2xl bg-white shadow-card" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="container-page py-16 text-center">
        <p className="text-ink-muted">{error || 'Profile not found'}</p>
        <Link to="/talent" className="btn-primary mt-4 inline-flex cursor-pointer">
          Back to talent
        </Link>
      </div>
    )
  }

  const name = profile.full_name || 'Developer'

  return (
    <div className="container-page py-8 sm:py-12">
      <Link to="/talent" className="text-sm font-semibold text-brand hover:text-brand-hover">
        ← Back to talent
      </Link>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-8 sm:px-8">
          <div className="flex flex-wrap items-start gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white text-2xl font-bold text-slate-700">
              {profile.profile_picture_url ? (
                <img src={profile.profile_picture_url} alt="" className="h-full w-full object-cover" />
              ) : (
                companyInitial(name)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{name}</h1>
              <p className="mt-1 text-ink-muted">
                {[profile.current_role, profile.current_company].filter(Boolean).join(' at ') ||
                  'Ruby on Rails developer'}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {[
                  profile.location || [profile.city, profile.state, profile.country].filter(Boolean).join(', '),
                  profile.experience != null ? `${profile.experience} years experience` : null,
                  profile.notice_period ? `Notice: ${profile.notice_period}` : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={() => void toggleSave()}
              className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                profile.saved ? 'btn-secondary' : 'btn-primary'
              }`}
            >
              {profile.saved ? 'Saved' : 'Save profile'}
            </button>
          </div>
        </div>

        <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {(profile.bio || profile.career_summary) && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">About</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {profile.career_summary || profile.bio}
                </p>
              </section>
            )}

            {!!profile.skills?.length && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Skills</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {!!profile.work_experience_details?.length && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Experience</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                  {profile.work_experience_details.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <h2 className="text-sm font-bold text-ink">Details</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <Row label="Education" value={[profile.highest_qualification, profile.university].filter(Boolean).join(', ')} />
                <Row label="Grad year" value={profile.graduation_year ? String(profile.graduation_year) : null} />
                <Row label="Job type" value={profile.job_type} />
                <Row label="Shift" value={profile.shift_preference} />
                <Row label="Expected CTC" value={profile.expected_ctc_label} />
                <Row
                  label="Preferred locations"
                  value={profile.preferred_locations?.length ? profile.preferred_locations.join(', ') : null}
                />
              </dl>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h2 className="text-sm font-bold text-ink">Links</h2>
              <ul className="mt-3 list-none space-y-2 p-0 text-sm">
                {profile.linkedin_profile && (
                  <li>
                    <a
                      href={profile.linkedin_profile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer font-medium text-brand hover:text-brand-hover"
                    >
                      LinkedIn
                    </a>
                  </li>
                )}
                {profile.github_profile && (
                  <li>
                    <a
                      href={profile.github_profile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer font-medium text-brand hover:text-brand-hover"
                    >
                      GitHub
                    </a>
                  </li>
                )}
                {profile.portfolio_website && (
                  <li>
                    <a
                      href={profile.portfolio_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer font-medium text-brand hover:text-brand-hover"
                    >
                      Portfolio
                    </a>
                  </li>
                )}
                {profile.resume?.url && (
                  <li>
                    <a
                      href={profile.resume.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer font-medium text-brand hover:text-brand-hover"
                    >
                      Resume{profile.resume.filename ? ` (${profile.resume.filename})` : ''}
                    </a>
                  </li>
                )}
                {!profile.linkedin_profile &&
                  !profile.github_profile &&
                  !profile.portfolio_website &&
                  !profile.resume?.url && (
                    <li className="text-ink-muted">No public links shared.</li>
                  )}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  )
}
