import { ContentSection, CtaBand, FeatureCard, PageHero } from '@/components/marketing/PageChrome'

const OPEN_ROLES = [
  {
    title: 'Senior Ruby on Rails Engineer',
    type: 'Full-time',
    location: 'Remote / Hybrid',
    summary: 'Own features end-to-end across Rails APIs, background jobs, and product polish.',
    requirements: ['5+ years Rails', 'Strong PostgreSQL', 'Comfortable with Hotwire or React'],
  },
  {
    title: 'Frontend Engineer (React)',
    type: 'Full-time',
    location: 'Remote',
    summary: 'Shape the ROR World SPA — jobs discovery, dashboards, and delightful hiring UX.',
    requirements: ['React + TypeScript', 'Design-sensitive UI work', 'API integration experience'],
  },
  {
    title: 'Community Manager',
    type: 'Part-time / Contract',
    location: 'Remote',
    summary: 'Grow conversations across blog, social, and partnerships in the Rails world.',
    requirements: ['Rails community familiarity', 'Clear writing', 'Async collaboration'],
  },
]

export function CareersPage() {
  return (
    <div>
      <PageHero
        eyebrow="Careers"
        title={
          <>
            Build the future of <span className="text-brand">Rails hiring</span>
          </>
        }
        description="Join a small team shipping a focused product for Ruby on Rails developers and companies worldwide."
        actions={
          <a href="mailto:hello@rorindia.com?subject=Careers%20at%20ROR%20World" className="btn-primary cursor-pointer">
            Send your resume
          </a>
        }
      />

      <ContentSection
        title="Why work with us"
        lead="Meaningful product work, async-friendly culture, and a community that cares about craft."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FeatureCard title="Impact" body="Your work reaches Rails developers looking for their next role every day." />
          <FeatureCard title="Craft" body="We obsess over clarity — in product UX, APIs, and how we hire." />
          <FeatureCard title="Flexibility" body="Remote-friendly collaboration with thoughtful rituals, not meeting theater." />
          <FeatureCard title="Growth" body="Ship publicly, learn from the community, and stretch across the stack." />
        </div>
      </ContentSection>

      <ContentSection title="Open positions" lead="Roles evolve quickly — if you don’t see a perfect match, still say hello.">
        <div className="space-y-4">
          {OPEN_ROLES.map((role) => (
            <article
              key={role.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition duration-200 hover:border-brand/25 hover:shadow-card-hover"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-ink">{role.title}</h3>
                  <p className="mt-1 flex flex-wrap gap-2 text-xs font-medium text-ink-muted">
                    <span className="rounded-full bg-brand-soft px-2.5 py-1 text-brand">{role.type}</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">{role.location}</span>
                  </p>
                </div>
                <a
                  href={`mailto:hello@rorindia.com?subject=${encodeURIComponent(`Application: ${role.title}`)}`}
                  className="btn-primary !py-2 cursor-pointer"
                >
                  Apply
                </a>
              </div>
              <p className="mt-3 text-sm text-ink-muted">{role.summary}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {role.requirements.map((req) => (
                  <li key={req} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-700">
                    {req}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </ContentSection>

      <CtaBand
        title="Don’t see your role?"
        description="Tell us what you’re great at — we’re always open to exceptional Rails people."
        primary={{ to: '/contact', label: 'Contact us' }}
        secondary={{ to: '/about', label: 'About ROR World' }}
      />
    </div>
  )
}
