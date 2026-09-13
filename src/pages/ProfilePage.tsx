import { useEffect, useState, type ReactNode } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { companyInitial } from '@/lib/format'
import type { DeveloperProfile } from '@/types'

export function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [exists, setExists] = useState(false)
  const [profile, setProfile] = useState<DeveloperProfile | null>(null)
  const [stats, setStats] = useState({ applications: 0, saved_jobs: 0 })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    api
      .fetchProfile()
      .then((res) => {
        if (cancelled) return
        setExists(res.exists)
        setProfile(res.data)
        if (res.stats) setStats(res.stats)
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="container-page py-10">
        <div className="h-64 animate-pulse rounded-2xl bg-white" />
      </div>
    )
  }

  if (!exists || !profile) {
    return <Navigate to="/profile/edit" replace />
  }

  if (error) {
    return <div className="container-page py-16 text-ink-muted">{error}</div>
  }

  const completion = profile.profile_completion || 0

  return (
    <div className="container-page py-8 sm:py-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-2xl font-bold text-slate-700">
            {profile.profile_picture_url ? (
              <img src={profile.profile_picture_url} alt="" className="h-full w-full object-cover" />
            ) : (
              companyInitial(profile.full_name)
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{profile.full_name}</h1>
            <p className="mt-1 text-base text-slate-600">{profile.current_role}</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
              {profile.location && (
                <span className="inline-flex items-center gap-1.5">
                  <PinIcon />
                  {profile.location}
                </span>
              )}
              {profile.experience != null && (
                <span className="inline-flex items-center gap-1.5">
                  <BriefcaseIcon />
                  {profile.experience} years experience
                </span>
              )}
            </div>
          </div>
        </div>
        <Link to="/profile/edit" className="btn-secondary shrink-0">
          <PenIcon />
          Edit Profile
        </Link>
      </header>

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
        <div className="space-y-5">
          {(profile.bio || profile.career_summary) && (
            <section className="dash-panel">
              <PanelTitle icon={<DocIcon />} title="Professional Summary" />
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {profile.bio || profile.career_summary}
              </p>
            </section>
          )}

          <section className="dash-panel">
            <PanelTitle icon={<InfoIcon />} title="Professional Information" />
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <InfoItem label="Current Company" value={profile.current_company || 'Not specified'} />
              <InfoItem label="Current CTC" value={profile.current_ctc_label} />
              <InfoItem label="Expected CTC" value={profile.expected_ctc_label} />
              <InfoItem label="Notice Period" value={profile.notice_period || 'Not specified'} />
              <InfoItem label="Job Type Preference" value={profile.job_type || 'Not specified'} />
              <InfoItem label="Shift Preference" value={profile.shift_preference || 'Not specified'} />
              <InfoItem label="Qualification" value={profile.highest_qualification || 'Not specified'} />
              <InfoItem label="University" value={profile.university || 'Not specified'} />
              <InfoItem
                label="Graduation Year"
                value={profile.graduation_year != null ? String(profile.graduation_year) : 'Not specified'}
              />
            </dl>
          </section>

          {profile.skills.length > 0 && (
            <section className="dash-panel">
              <PanelTitle icon={<SkillsIcon />} title="Skills & Expertise" />
              <ul className="mt-4 flex list-none flex-wrap gap-2 p-0">
                {profile.skills.map((skill) => (
                  <li key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {skill}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {profile.work_experience_details.length > 0 && (
            <section className="dash-panel">
              <PanelTitle icon={<BriefcaseIcon />} title="Work Experience" />
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
                {profile.work_experience_details.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-5">
          <section className="dash-panel">
            <h2 className="text-base font-bold text-ink">Quick Actions</h2>
            <ul className="mt-3 list-none space-y-1 p-0">
              {[
                { to: '/profile/edit', label: 'Edit Profile' },
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/track-applications', label: 'Track Applications' },
                { to: '/saved-jobs', label: 'Saved Jobs' },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="flex cursor-pointer items-center justify-between rounded-xl px-2 py-2.5 text-sm font-medium text-ink transition duration-200 hover:bg-slate-50"
                  >
                    <span>{item.label}</span>
                    <ChevronIcon />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="dash-panel">
            <h2 className="text-base font-bold text-ink">Profile Stats</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                to="/track-applications"
                className="rounded-xl border border-slate-200 px-3 py-3 text-center transition duration-200 hover:border-brand-border hover:bg-brand-soft/40"
              >
                <p className="text-2xl font-bold text-ink">{stats.applications}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Tracked</p>
              </Link>
              <div className="rounded-xl border border-slate-200 px-3 py-3 text-center">
                <p className="text-2xl font-bold text-ink">{stats.saved_jobs}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Saved Jobs</p>
              </div>
            </div>
          </section>

          <section className="dash-panel">
            <h2 className="text-base font-bold text-ink">Profile Status</h2>
            <div className="mt-4">
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-ink" style={{ width: `${completion}%` }} />
              </div>
              <p className="mt-3 text-sm font-semibold text-ink">
                {completion >= 100 ? 'Profile Complete!' : `${completion}% complete`}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {completion >= 100
                  ? 'All required information provided.'
                  : 'Add more details to improve your profile.'}
              </p>
            </div>
            {profile.resume && (
              <a
                href={profile.resume.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex text-sm font-semibold text-brand hover:underline"
              >
                Download resume
              </a>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}

function PanelTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-brand">{icon}</span>
      <h2 className="text-base font-bold text-ink">{title}</h2>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
    </div>
  )
}

function PinIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

function BriefcaseIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" d="M9 6V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1M4 10h16v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9Z" />
    </svg>
  )
}

function PenIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" />
    </svg>
  )
}

function DocIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" d="M8 7h8M8 12h8M8 17h5M7 3h8l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 11v6M12 8h.01" />
    </svg>
  )
}

function SkillsIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" d="M12 3 4 7v5c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V7l-8-4Z" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" d="m9 6 6 6-6 6" />
    </svg>
  )
}
