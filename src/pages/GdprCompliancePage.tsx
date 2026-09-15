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

function Mail({ to }: { to: string }) {
  return (
    <a href={`mailto:${to}`} className="font-semibold text-brand hover:text-brand-hover">
      {to}
    </a>
  )
}

export function GdprCompliancePage() {
  const sections: LegalSection[] = [
    {
      id: 'introduction',
      title: 'Introduction',
      body: (
        <>
          <P>
            ROR World is committed to protecting personal data of users, including those in the EU and EEA. This page
            explains how we align with the General Data Protection Regulation (GDPR) and your rights under it.
          </P>
          <P>
            GDPR applies to organizations that process personal data of individuals in the EU/EEA, regardless of where
            the organization is located.
          </P>
        </>
      ),
    },
    {
      id: 'commitment',
      title: 'Our Commitment',
      body: (
        <Ul
          items={[
            'Process data lawfully, fairly, and transparently',
            'Collect data only for specified, legitimate purposes',
            'Keep data adequate, relevant, and limited',
            'Keep data accurate and up to date',
            'Retain data only as long as necessary',
            'Implement appropriate security measures',
            'Respect and facilitate your data protection rights',
          ]}
        />
      ),
    },
    {
      id: 'legal-basis',
      title: 'Legal Basis for Processing',
      body: (
        <>
          <H3>Consent</H3>
          <Ul items={['Marketing and newsletters', 'Job alerts where consent-based', 'Non-essential cookies']} />
          <P>You may withdraw consent at any time via unsubscribe links or by contacting us.</P>
          <H3>Contract performance</H3>
          <Ul items={['Account creation and management', 'Job applications', 'Core platform services']} />
          <H3>Legitimate interests</H3>
          <Ul items={['Improving the product', 'Security and fraud prevention', 'Usage analytics']} />
          <H3>Legal obligations</H3>
          <P>We process data when required to comply with law.</P>
        </>
      ),
    },
    {
      id: 'rights',
      title: 'Your Rights Under GDPR',
      body: (
        <>
          <Ul
            items={[
              <><strong>Access</strong> — confirmation and copy of your data</>,
              <><strong>Rectification</strong> — correct inaccurate data</>,
              <><strong>Erasure</strong> — request deletion where applicable</>,
              <><strong>Restriction</strong> — limit processing in certain cases</>,
              <><strong>Portability</strong> — receive data in a structured format</>,
              <><strong>Objection</strong> — object to certain processing</>,
              <><strong>Withdraw consent</strong> — without affecting prior lawful processing</>,
            ]}
          />
          <P>
            To exercise these rights, email <Mail to="hi@rorworld.com" />. We respond within the timeframes required
            by GDPR.
          </P>
        </>
      ),
    },
    {
      id: 'transfers',
      title: 'International Transfers',
      body: (
        <P>
          When we transfer personal data outside the EU/EEA, we use appropriate safeguards such as standard contractual
          clauses or equivalent mechanisms where required.
        </P>
      ),
    },
    {
      id: 'security',
      title: 'Security Measures',
      body: (
        <Ul
          items={[
            'Encryption in transit',
            'Access controls and authentication',
            'Vendor due diligence for processors',
            'Incident response practices',
          ]}
        />
      ),
    },
    {
      id: 'processors',
      title: 'Processors',
      body: (
        <P>
          We use service providers (hosting, email, analytics) who process data on our behalf under contractual terms
          that require appropriate protection.
        </P>
      ),
    },
    {
      id: 'privacy',
      title: 'Related Policies',
      body: (
        <P>
          See also our{' '}
          <Link to="/privacy-policy" className="font-semibold text-brand hover:text-brand-hover">
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link to="/cookie-policy" className="font-semibold text-brand hover:text-brand-hover">
            Cookie Policy
          </Link>
          .
        </P>
      ),
    },
    {
      id: 'contact',
      title: 'Contact / DPO inquiries',
      body: (
        <P>
          GDPR requests: <Mail to="hi@rorworld.com" />
        </P>
      ),
    },
  ]

  return (
    <LegalDocument
      title="GDPR Compliance"
      updated={UPDATED}
      intro="How ROR World approaches GDPR for users in the EU and EEA."
      sections={sections}
    />
  )
}
