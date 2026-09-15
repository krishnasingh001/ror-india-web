import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { ContentSection, PageHero } from '@/components/marketing/PageChrome'

const SUBJECTS = [
  { value: 'general', label: 'General inquiry' },
  { value: 'job_search', label: 'Job search help' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'technical', label: 'Technical support' },
  { value: 'other', label: 'Other' },
]

const FAQS = [
  {
    q: 'How do I create a profile?',
    a: 'Sign up, then complete your profile from the dashboard. A strong profile helps you apply faster.',
  },
  {
    q: 'Can companies post jobs?',
    a: 'Yes. Create a recruiter account and publish openings that reach Rails-focused candidates.',
  },
  {
    q: 'Is ROR World free for candidates?',
    a: 'Browsing jobs, saving roles, and applying with your profile are free for candidates.',
  },
  {
    q: 'How do I track applications?',
    a: 'Use Track Applications from your dashboard to manage roles across ROR World and external boards.',
  },
]

export function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('general')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [sent, setSent] = useState(false)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (honeypot.trim()) return
    const subjectLabel = SUBJECTS.find((s) => s.value === subject)?.label || subject
    const body = `Name: ${name}\nEmail: ${email}\nSubject: ${subjectLabel}\n\n${message}`
    window.location.href = `mailto:hi@rorworld.com?subject=${encodeURIComponent(
      `[ROR World] ${subjectLabel}`,
    )}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  return (
    <div>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Get in <span className="text-brand">touch</span>
          </>
        }
        description="Questions about jobs, hiring, partnerships, or the product? We’d love to hear from you."
      />

      <section className="border-b border-slate-200/70 py-12 sm:py-16">
        <div className="container-page grid gap-10 lg:grid-cols-5">
          <div className="space-y-5 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <h2 className="text-sm font-bold uppercase tracking-wide text-ink">Email</h2>
              <a href="mailto:hi@rorworld.com" className="mt-2 block cursor-pointer text-brand hover:text-brand-hover">
                hi@rorworld.com
              </a>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <h2 className="text-sm font-bold uppercase tracking-wide text-ink">Phone</h2>
              <p className="mt-2 text-slate-700">+91 98672 71103</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <h2 className="text-sm font-bold uppercase tracking-wide text-ink">Location</h2>
              <p className="mt-2 text-slate-700">Mumbai, India · Remote-friendly team</p>
            </div>
          </div>

          <div className="lg:col-span-3">
            <form
              onSubmit={onSubmit}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel sm:p-8"
              noValidate
            >
              <h2 className="text-xl font-bold tracking-tight text-ink">Send a message</h2>
              <p className="mt-1 text-sm text-ink-muted">We’ll open your email client with the details filled in.</p>

              {/* Honeypot */}
              <label className="sr-only" htmlFor="website">
                Website
              </label>
              <input
                id="website"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="text-sm font-semibold text-ink">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    required
                    className="input-field mt-1.5"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="text-sm font-semibold text-ink">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    className="input-field mt-1.5"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="contact-subject" className="text-sm font-semibold text-ink">
                  Subject
                </label>
                <select
                  id="contact-subject"
                  className="input-field mt-1.5 cursor-pointer"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  {SUBJECTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4">
                <label htmlFor="contact-message" className="text-sm font-semibold text-ink">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  className="input-field mt-1.5 resize-y"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary mt-5 w-full cursor-pointer sm:w-auto">
                Send message
              </button>
              {sent && (
                <p className="mt-3 text-sm text-emerald-700" role="status">
                  If your email app didn’t open, write us at hi@rorworld.com.
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      <ContentSection title="Frequently asked questions">
        <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {FAQS.map((item) => (
            <details key={item.q} className="group px-5 py-4">
              <summary className="cursor-pointer list-none font-semibold text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-3">
                  {item.q}
                  <span className="text-brand transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-6 text-sm text-ink-muted">
          Prefer browsing?{' '}
          <Link to="/" className="font-semibold text-brand hover:text-brand-hover">
            Explore jobs
          </Link>{' '}
          or{' '}
          <Link to="/sign-up" className="font-semibold text-brand hover:text-brand-hover">
            create a profile
          </Link>
          .
        </p>
      </ContentSection>
    </div>
  )
}
