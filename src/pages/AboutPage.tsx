import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ContentSection, CtaBand, FeatureCard, PageHero } from '@/components/marketing/PageChrome'
import { api } from '@/lib/api'

function formatStat(n: number) {
  if (n >= 1000) return `${Math.floor(n / 100) / 10}k+`
  return `${n}+`
}

export function AboutPage() {
  const [stats, setStats] = useState<{ jobs: number; companies: number; developers: number } | null>(
    null,
  )

  useEffect(() => {
    let cancelled = false
    api
      .fetchStats()
      .then((res) => {
        if (!cancelled) {
          setStats({
            jobs: res.data.active_jobs ?? res.data.jobs,
            companies: res.data.companies,
            developers: res.data.developers,
          })
        }
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <PageHero
        eyebrow="About ROR World"
        title={
          <>
            The Rails job platform built for{' '}
            <span className="text-brand">developers worldwide</span>
          </>
        }
        description="We connect talented Ruby on Rails engineers with companies shipping real products — from early startups to global teams."
        actions={
          <>
            <Link to="/" className="btn-primary cursor-pointer">
              Browse jobs
            </Link>
            <Link to="/companies" className="btn-secondary cursor-pointer">
              Explore companies
            </Link>
          </>
        }
      />

      {stats && (
        <section className="border-b border-slate-200/70 bg-white py-8">
          <div className="container-page grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Active jobs', value: formatStat(stats.jobs) },
              { label: 'Companies', value: formatStat(stats.companies) },
              { label: 'Developers', value: formatStat(stats.developers) },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <ContentSection
        title="Built for the Rails community"
        lead="Whether you’re hiring or looking for your next role, ROR World is designed around how Rails teams actually work."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <FeatureCard
            title="For developers"
            body="Discover curated Rails roles, save listings, track applications, and grow your career in a focused Ruby community."
            items={['Remote & on-site opportunities', 'Transparent role details', 'Weekly job alerts']}
          />
          <FeatureCard
            title="For companies"
            body="Reach skilled Rails developers and hire faster with tools built for technical recruitment."
            items={['Post jobs in minutes', 'Company profiles that stand out', 'Recruiter-friendly workflows']}
          />
        </div>
      </ContentSection>

      <ContentSection
        title="Our mission"
        lead="Make Rails hiring clearer, fairer, and faster — for candidates and companies around the world."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { step: '01', title: 'Create your profile', body: 'Show your Rails experience, preferences, and links in one place.' },
            { step: '02', title: 'Explore & apply', body: 'Browse curated roles or post openings that attract the right talent.' },
            { step: '03', title: 'Connect & grow', body: 'Track applications, follow companies, and stay sharp with community content.' },
          ].map((item) => (
            <div key={item.step} className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="font-brand text-sm font-bold text-brand">{item.step}</p>
              <h3 className="mt-2 font-bold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </ContentSection>

      <ContentSection title="What we value">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Community first', body: 'Rails people helping Rails people.' },
            { title: 'Clarity', body: 'Honest job details beat hype every time.' },
            { title: 'Quality', body: 'Curated roles and useful tooling — not noise.' },
            { title: 'Global reach', body: 'Talent and teams, wherever they build.' },
          ].map((v) => (
            <article key={v.title} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <h3 className="font-bold text-ink">{v.title}</h3>
              <p className="mt-1 text-sm text-ink-muted">{v.body}</p>
            </article>
          ))}
        </div>
      </ContentSection>

      <CtaBand
        title="Ready to find your next Rails role?"
        description="Join developers and companies already using ROR World."
        primary={{ to: '/sign-up', label: 'Create account' }}
        secondary={{ to: '/', label: 'Browse jobs' }}
      />
    </div>
  )
}
