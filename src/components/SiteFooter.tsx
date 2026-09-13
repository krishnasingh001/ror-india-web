import { FormEvent, useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '@/components/BrandLogo'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

function formatStat(n: number) {
  if (n >= 1000) return `${Math.floor(n / 100) / 10}k+`
  return `${n}+`
}

export function SiteFooter() {
  const { user } = useAuth()
  const year = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{ developers: number; companies: number; jobs: number } | null>(
    null,
  )

  useEffect(() => {
    let cancelled = false
    api
      .fetchStats()
      .then((res) => {
        if (!cancelled) {
          setStats({
            developers: res.data.developers,
            companies: res.data.companies,
            jobs: res.data.active_jobs ?? res.data.jobs,
          })
        }
      })
      .catch(() => {
        /* footer still works without stats */
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function onSubscribe(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setBusy(true)
    setMessage(null)
    setError(null)
    try {
      const res = await api.subscribe(email.trim())
      setMessage(res.message || 'Subscribed successfully.')
      setEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not subscribe.')
    } finally {
      setBusy(false)
    }
  }

  const exploreLinks = [
    { label: 'Jobs', to: '/' },
    { label: 'Companies', to: '/companies' },
    { label: 'Blog', to: '/blog' },
    ...(user
      ? [
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Track Applications', to: '/track-applications' },
          { label: 'Saved Jobs', to: '/saved-jobs' },
        ]
      : [
          { label: 'Sign in', to: '/sign-in' },
          { label: 'Sign up', to: '/sign-up' },
        ]),
  ]

  const companyLinks = [
    { label: 'About Us', to: '/about' },
    { label: 'Careers', to: '/careers' },
    { label: 'Contact', to: '/contact' },
    { label: 'Shop', to: '/shop' },
  ]

  const legalLinks = [
    { label: 'Privacy Policy', to: '/privacy-policy' },
    { label: 'Terms of Service', to: '/terms-of-service' },
    { label: 'Cookie Policy', to: '/cookie-policy' },
    { label: 'GDPR Compliance', to: '/gdpr-compliance' },
    { label: 'Sitemap', to: '/sitemap' },
  ]

  return (
    <footer className="site-footer" id="site-footer" role="contentinfo">
      <div className="container-page py-12 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-flex" aria-label="ROR World home">
              <BrandLogo />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
              Connecting Ruby on Rails developers with top companies worldwide. Find your dream job
              or hire the perfect developer for your team.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <SocialLink href="https://twitter.com/rorindia" label="ROR World on Twitter">
                <TwitterIcon />
              </SocialLink>
              <SocialLink
                href="https://www.linkedin.com/company/rorindia"
                label="ROR World on LinkedIn"
              >
                <LinkedInIcon />
              </SocialLink>
              <SocialLink href="https://github.com/rorindia" label="ROR World on GitHub">
                <GitHubIcon />
              </SocialLink>
            </div>
          </div>

          {/* Explore */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold tracking-tight text-ink">Explore</h3>
            <ul className="mt-4 list-none space-y-2.5 p-0">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-600 transition hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold tracking-tight text-ink">Company</h3>
            <ul className="mt-4 list-none space-y-2.5 p-0">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="cursor-pointer text-sm text-slate-600 transition duration-200 hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold tracking-tight text-ink">Legal</h3>
            <ul className="mt-4 list-none space-y-2.5 p-0">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="cursor-pointer text-sm text-slate-600 transition duration-200 hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="sm:col-span-2 lg:col-span-2">
            <h3 className="text-sm font-bold tracking-tight text-ink">Stay updated</h3>
            <p className="mt-2 text-sm text-slate-600">
              Weekly Rails job alerts and community news.
            </p>
            <form onSubmit={onSubscribe} className="mt-4 space-y-2">
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Email for newsletter
              </label>
              <input
                id="footer-newsletter-email"
                type="email"
                required
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full !py-2.5 text-sm"
              />
              <button type="submit" disabled={busy} className="btn-primary w-full !py-2.5">
                {busy ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>
            <div className="mt-2 min-h-[1.25rem]" role="status" aria-live="polite">
              {message && <p className="text-xs text-emerald-700">{message}</p>}
              {error && <p className="text-xs text-brand">{error}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200/80 bg-slate-50/60">
        <div className="container-page flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            © {year} ROR World. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            {stats && (
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-600 sm:text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <UsersIcon />
                  {formatStat(stats.developers)} Developers
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BuildingIcon />
                  {formatStat(stats.companies)} Companies
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BriefcaseIcon />
                  {formatStat(stats.jobs)} Jobs
                </span>
              </p>
            )}
            <a
              href="https://www.makeinindia.com/"
              target="_blank"
              rel="noopener noreferrer"
              title="Make in India"
              className="inline-flex shrink-0"
            >
              <img
                src="/make-in-india.png"
                alt="Make in India"
                className="h-8 w-auto object-contain sm:h-9"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-brand-border hover:bg-brand-soft hover:text-brand"
    >
      {children}
    </a>
  )
}

function TwitterIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.833L1.254 2.25H8.08l4.253 5.622L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.744.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
      />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="3.5" />
      <path strokeLinecap="round" d="M19 8a3 3 0 0 1 0 6M21 21v-1.5a3.5 3.5 0 0 0-2.5-3.35" />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14 9h5a1 1 0 0 1 1 1v11M8 8h2M8 12h2M8 16h2M17 13h1M17 17h1" />
    </svg>
  )
}

function BriefcaseIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M4 7h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" />
      <path strokeLinecap="round" d="M4 12h16" />
    </svg>
  )
}
