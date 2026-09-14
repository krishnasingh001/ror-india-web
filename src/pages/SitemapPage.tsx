import { Link } from 'react-router-dom'
import { PageHero } from '@/components/marketing/PageChrome'

type SitemapGroup = {
  title: string
  links: { label: string; to: string }[]
}

const GROUPS: SitemapGroup[] = [
  {
    title: 'Explore',
    links: [
      { label: 'Jobs', to: '/' },
      { label: 'Companies', to: '/companies' },
      { label: 'Blog', to: '/blog' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign in', to: '/sign-in' },
      { label: 'Sign up', to: '/sign-up' },
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Post a job', to: '/jobs/new' },
      { label: 'My jobs', to: '/my-jobs' },
      { label: 'Applications', to: '/recruiter/applications' },
      { label: 'Browse talent', to: '/talent' },
      { label: 'Saved profiles', to: '/saved-profiles' },
      { label: 'Recruiter profile', to: '/recruiter/profile' },
      { label: 'Saved jobs', to: '/saved-jobs' },
      { label: 'Track applications', to: '/track-applications' },
      { label: 'Profile', to: '/profile' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Careers', to: '/careers' },
      { label: 'Contact', to: '/contact' },
      { label: 'Shop', to: '/shop' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms of Service', to: '/terms-of-service' },
      { label: 'Cookie Policy', to: '/cookie-policy' },
      { label: 'GDPR Compliance', to: '/gdpr-compliance' },
      { label: 'Sitemap', to: '/sitemap' },
    ],
  },
]

export function SitemapPage() {
  return (
    <div>
      <PageHero
        eyebrow="Sitemap"
        title={
          <>
            Find your way around <span className="text-brand">ROR World</span>
          </>
        }
        description="A human-readable index of key pages on this site."
      />

      <section className="border-b border-slate-200/70 py-12 sm:py-16">
        <div className="container-page grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {GROUPS.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="text-sm font-bold tracking-tight text-ink">{group.title}</h2>
              <ul className="mt-4 list-none space-y-2.5 p-0">
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="cursor-pointer text-sm text-slate-600 transition duration-200 hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </section>
    </div>
  )
}
