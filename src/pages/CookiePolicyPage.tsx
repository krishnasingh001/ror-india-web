import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { LegalDocument, type LegalSection } from '@/components/marketing/LegalDocument'

const UPDATED = 'September 13, 2026'

function P({ children }: { children: ReactNode }) {
  return <p>{children}</p>
}

function Ul({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}

function H3({ children }: { children: ReactNode }) {
  return <h3 className="pt-2 text-base font-bold text-ink">{children}</h3>
}

export function CookiePolicyPage() {
  const sections: LegalSection[] = [
    {
      id: 'introduction',
      title: 'Introduction',
      body: (
        <P>
          This Cookie Policy explains how ROR World uses cookies and similar technologies on rorworld.com. Read it with
          our{' '}
          <Link to="/privacy-policy" className="font-semibold text-brand hover:text-brand-hover">
            Privacy Policy
          </Link>
          .
        </P>
      ),
    },
    {
      id: 'what-are-cookies',
      title: 'What Are Cookies?',
      body: (
        <P>
          Cookies are small text files stored on your device when you visit a site. They help sites work reliably,
          remember preferences, and understand usage.
        </P>
      ),
    },
    {
      id: 'types',
      title: 'Types of Cookies We Use',
      body: (
        <>
          <H3>Essential</H3>
          <P>Required for security, sessions, and core functionality. These cannot be disabled if you use the Service.</P>
          <Ul
            items={[
              'Session cookies to keep you browsing securely',
              'Authentication cookies to keep you signed in',
              'Security / CSRF protection cookies',
            ]}
          />
          <H3>Functional</H3>
          <Ul items={['Remember preferences such as filters or display choices']} />
          <H3>Analytics</H3>
          <Ul items={['Help us understand traffic and improve product quality (e.g. analytics tools)']} />
          <H3>Marketing</H3>
          <Ul items={['May be used for relevant messaging or campaign measurement where applicable']} />
        </>
      ),
    },
    {
      id: 'examples',
      title: 'Examples',
      body: (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2 font-semibold">Cookie</th>
                <th className="px-3 py-2 font-semibold">Purpose</th>
                <th className="px-3 py-2 font-semibold">Duration</th>
                <th className="px-3 py-2 font-semibold">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ['_session_id', 'Maintains browsing session', 'Session', 'Essential'],
                ['_remember_user_token', 'Keeps you signed in', '30 days', 'Essential'],
                ['_csrf_token', 'CSRF protection', 'Session', 'Essential'],
                ['_ga / _gid', 'Analytics (if enabled)', 'Varies', 'Analytics'],
              ].map((row) => (
                <tr key={row[0]}>
                  {row.map((cell) => (
                    <td key={cell} className="px-3 py-2 text-slate-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
    {
      id: 'manage',
      title: 'Managing Cookies',
      body: (
        <>
          <P>
            Most browsers let you block or delete cookies via settings. Blocking essential cookies may break sign-in and
            other features. You can also use browser privacy tools and opt-out mechanisms provided by analytics vendors
            where available.
          </P>
        </>
      ),
    },
    {
      id: 'updates',
      title: 'Updates',
      body: (
        <P>
          We may update this Cookie Policy as our practices change. The &quot;Last updated&quot; date at the top will
          change when we do.
        </P>
      ),
    },
    {
      id: 'contact',
      title: 'Contact',
      body: (
        <P>
          Questions:{' '}
          <a href="mailto:hi@rorworld.com" className="font-semibold text-brand hover:text-brand-hover">
            hi@rorworld.com
          </a>
        </P>
      ),
    },
  ]

  return (
    <LegalDocument
      title="Cookie Policy"
      updated={UPDATED}
      intro="How cookies and similar technologies work on ROR World."
      sections={sections}
    />
  )
}
