import type { ReactNode } from 'react'
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

export function PrivacyPolicyPage() {
  const sections: LegalSection[] = [
    {
      id: 'introduction',
      title: 'Introduction',
      body: (
        <>
          <P>
            Welcome to ROR World (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your
            privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when
            you visit rorworld.com (and related domains) and use our services.
          </P>
          <P>
            By using our website and services, you agree to the collection and use of information in accordance with
            this policy. If you do not agree, please do not use our services.
          </P>
        </>
      ),
    },
    {
      id: 'information-we-collect',
      title: 'Information We Collect',
      body: (
        <>
          <H3>Information you provide</H3>
          <Ul
            items={[
              <><strong>Account information:</strong> name, email, password, and profile details</>,
              <><strong>Profile information:</strong> skills, experience, education, resume, and links</>,
              <><strong>Applications:</strong> materials you submit when applying for jobs</>,
              <><strong>Company information:</strong> details if you post jobs as a recruiter</>,
              <><strong>Communications:</strong> messages and inquiries you send us</>,
              <><strong>Subscriptions:</strong> email and preferences for alerts and newsletters</>,
            ]}
          />
          <H3>Information collected automatically</H3>
          <Ul
            items={[
              <><strong>Usage data:</strong> pages visited, time on site, and interactions</>,
              <><strong>Device information:</strong> IP address, browser, OS, and similar signals</>,
              <><strong>Location:</strong> approximate location from IP address</>,
              <><strong>Cookies:</strong> see our Cookie Policy for details</>,
            ]}
          />
          <H3>Information from third parties</H3>
          <Ul
            items={[
              <>Social / OAuth providers (e.g. Google) when you sign in with them</>,
              <>Analytics providers that help us understand site usage</>,
            ]}
          />
        </>
      ),
    },
    {
      id: 'how-we-use',
      title: 'How We Use Your Information',
      body: (
        <Ul
          items={[
            <><strong>Provide services:</strong> accounts, matching, applications, and platform features</>,
            <><strong>Improve services:</strong> research, analytics, and product development</>,
            <><strong>Communicate:</strong> job alerts, updates, and support replies</>,
            <><strong>Security:</strong> detect and prevent fraud or abuse</>,
            <><strong>Legal compliance:</strong> meet legal obligations and protect our rights</>,
            <><strong>Marketing:</strong> promotional messages where permitted (you can opt out)</>,
          ]}
        />
      ),
    },
    {
      id: 'sharing',
      title: 'How We Share Your Information',
      body: (
        <>
          <Ul
            items={[
              <><strong>Employers:</strong> when you apply, we share relevant application materials</>,
              <><strong>Service providers:</strong> hosting, email, analytics, and similar vendors</>,
              <><strong>Legal reasons:</strong> if required by law or to protect rights and safety</>,
              <><strong>Business transfers:</strong> in a merger, acquisition, or asset sale</>,
              <><strong>With consent:</strong> when you explicitly agree</>,
            ]}
          />
          <P>
            <strong>We do not sell your personal information to third parties.</strong>
          </P>
        </>
      ),
    },
    {
      id: 'security',
      title: 'Data Security',
      body: (
        <>
          <P>
            We implement technical and organizational measures to protect personal information, including encryption in
            transit, access controls, and secure storage practices. No method of transmission or storage is 100% secure;
            we cannot guarantee absolute security.
          </P>
        </>
      ),
    },
    {
      id: 'rights',
      title: 'Your Rights and Choices',
      body: (
        <>
          <Ul
            items={[
              <><strong>Access</strong> the personal information we hold about you</>,
              <><strong>Correct</strong> inaccurate or incomplete information</>,
              <><strong>Delete</strong> information (subject to legal obligations)</>,
              <><strong>Portability</strong> — request a structured copy of your data</>,
              <><strong>Opt out</strong> of marketing and job alerts</>,
              <><strong>Delete your account</strong> through account settings where available</>,
            ]}
          />
          <P>
            Contact <Mail to="hi@rorworld.com" /> or use account settings to exercise these rights.
          </P>
        </>
      ),
    },
    {
      id: 'retention',
      title: 'Data Retention',
      body: (
        <P>
          We retain personal information as long as needed for the purposes in this policy, or longer if required by law.
          When you delete your account, we delete or anonymize data except where retention is legally required.
        </P>
      ),
    },
    {
      id: 'children',
      title: "Children's Privacy",
      body: (
        <P>
          Our services are not intended for individuals under 18. We do not knowingly collect data from children. If you
          believe we have, contact us and we will delete it.
        </P>
      ),
    },
    {
      id: 'transfers',
      title: 'International Data Transfers',
      body: (
        <P>
          Your information may be processed in countries other than your own. We take appropriate safeguards so your
          information receives adequate protection consistent with this policy.
        </P>
      ),
    },
    {
      id: 'changes',
      title: 'Changes to This Policy',
      body: (
        <P>
          We may update this Privacy Policy from time to time. Material changes will be posted on this page with an
          updated date. Please review periodically.
        </P>
      ),
    },
    {
      id: 'contact',
      title: 'Contact Us',
      body: (
        <>
          <P>Questions about this Privacy Policy or our data practices:</P>
          <P>
            <strong>ROR World</strong>
            <br />
            Email: <Mail to="hi@rorworld.com" />
            <br />
            Website: rorworld.com
          </P>
        </>
      ),
    },
  ]

  return (
    <LegalDocument
      title="Privacy Policy"
      updated={UPDATED}
      intro="How ROR World collects, uses, and protects your information."
      sections={sections}
    />
  )
}
