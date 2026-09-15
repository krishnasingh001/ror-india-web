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

export function TermsOfServicePage() {
  const sections: LegalSection[] = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      body: (
        <>
          <P>
            By accessing and using ROR World (&quot;the Service&quot;), you accept and agree to these Terms of Service
            (&quot;Terms&quot;). If you do not agree, do not use the Service.
          </P>
          <P>
            These Terms govern your access to our websites, applications, and services operated by ROR World
            (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
          </P>
        </>
      ),
    },
    {
      id: 'description',
      title: 'Description of Service',
      body: (
        <>
          <P>ROR World connects Ruby on Rails developers with job opportunities and companies seeking Rails talent. Services include:</P>
          <Ul
            items={[
              'Job listings and search',
              'Developer profiles',
              'Application tracking',
              'Company profiles and job posting tools',
              'Newsletters and job alerts',
              'Community blog content',
            ]}
          />
        </>
      ),
    },
    {
      id: 'accounts',
      title: 'User Accounts',
      body: (
        <>
          <H3>Account creation</H3>
          <Ul
            items={[
              'Provide accurate, current information',
              'Keep your credentials secure',
              'Accept responsibility for activity under your account',
              'Notify us of unauthorized use immediately',
            ]}
          />
          <H3>Account types</H3>
          <Ul
            items={[
              <><strong>Candidates:</strong> developers seeking opportunities</>,
              <><strong>Recruiters:</strong> employers posting jobs</>,
              <><strong>Admins:</strong> platform administrators</>,
            ]}
          />
          <H3>Termination</H3>
          <P>
            We may suspend or terminate accounts for conduct that violates these Terms or harms users, the Service, or
            third parties.
          </P>
        </>
      ),
    },
    {
      id: 'conduct',
      title: 'User Conduct',
      body: (
        <>
          <P>You agree not to:</P>
          <Ul
            items={[
              'Post false, misleading, or fraudulent information',
              'Impersonate others or misrepresent affiliation',
              'Harass, abuse, or harm other users',
              'Post discriminatory, offensive, or illegal content',
              'Interfere with or disrupt the Service',
              'Scrape or automate access without permission',
              'Attempt unauthorized access',
              'Spam or collect personal data without consent',
            ]}
          />
          <P>Content you post must be accurate, lawful, and non-infringing.</P>
        </>
      ),
    },
    {
      id: 'jobs',
      title: 'Job Postings and Applications',
      body: (
        <>
          <H3>Job postings</H3>
          <Ul
            items={[
              'Post only legitimate openings',
              'Provide accurate descriptions and compensation details where stated',
              'Comply with employment and anti-discrimination laws',
              'Do not require payment from applicants',
            ]}
          />
          <H3>Applications</H3>
          <Ul
            items={[
              'Submit accurate materials',
              'Do not abuse the application process with duplicate accounts',
              'Respect employer confidentiality',
            ]}
          />
          <P>
            ROR World facilitates connections between candidates and employers. We do not guarantee employment or
            suitable candidates and are not a party to any employment relationship.
          </P>
        </>
      ),
    },
    {
      id: 'ip',
      title: 'Intellectual Property',
      body: (
        <>
          <P>
            The Service and its original content are owned by ROR World and protected by intellectual property laws. You
            retain ownership of content you post; by posting, you grant us a license to use it to operate the Service.
          </P>
        </>
      ),
    },
    {
      id: 'payments',
      title: 'Payment Terms',
      body: (
        <Ul
          items={[
            'You agree to pay fees for any paid features you purchase',
            'Fees are non-refundable unless otherwise stated',
            'Pricing may change with notice',
            'You are responsible for applicable taxes',
          ]}
        />
      ),
    },
    {
      id: 'liability',
      title: 'Disclaimers and Liability',
      body: (
        <>
          <P>
            The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind. To the
            maximum extent permitted by law, ROR World is not liable for indirect, incidental, special, consequential, or
            punitive damages, or loss of profits, data, or goodwill.
          </P>
        </>
      ),
    },
    {
      id: 'indemnification',
      title: 'Indemnification',
      body: (
        <P>
          You agree to indemnify and hold harmless ROR World and its people from claims arising from your use of the
          Service or violation of these Terms.
        </P>
      ),
    },
    {
      id: 'privacy',
      title: 'Privacy',
      body: (
        <P>
          Your use is also governed by our{' '}
          <Link to="/privacy-policy" className="font-semibold text-brand hover:text-brand-hover">
            Privacy Policy
          </Link>
          .
        </P>
      ),
    },
    {
      id: 'modifications',
      title: 'Modifications',
      body: (
        <P>
          We may modify these Terms at any time. Continued use after changes constitutes acceptance of the updated Terms.
        </P>
      ),
    },
    {
      id: 'governing-law',
      title: 'Governing Law',
      body: (
        <P>
          These Terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of courts in
          India.
        </P>
      ),
    },
    {
      id: 'contact',
      title: 'Contact',
      body: (
        <P>
          Questions: <Mail to="hi@rorworld.com" />
        </P>
      ),
    },
  ]

  return (
    <LegalDocument
      title="Terms of Service"
      updated={UPDATED}
      intro="The rules for using ROR World as a candidate, recruiter, or visitor."
      sections={sections}
    />
  )
}
