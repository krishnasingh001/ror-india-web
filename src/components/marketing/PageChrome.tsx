import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type PageHeroProps = {
  eyebrow: string
  title: ReactNode
  description: string
  actions?: ReactNode
}

export function PageHero({ eyebrow, title, description, actions }: PageHeroProps) {
  return (
    <section className="hero-surface">
      <div className="container-page py-10 sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">{eyebrow}</p>
        <h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm text-ink-muted sm:text-base">{description}</p>
        {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
      </div>
    </section>
  )
}

type SectionProps = {
  id?: string
  title: string
  lead?: string
  children: ReactNode
  className?: string
}

export function ContentSection({ id, title, lead, children, className = '' }: SectionProps) {
  return (
    <section id={id} className={`border-b border-slate-200/70 py-12 sm:py-16 ${className}`}>
      <div className="container-page">
        <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h2>
        {lead && <p className="mt-2 max-w-2xl text-sm text-ink-muted sm:text-base">{lead}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  )
}

type FeatureCardProps = {
  title: string
  body: string
  items?: string[]
}

export function FeatureCard({ title, body, items }: FeatureCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition duration-200 hover:border-brand/30 hover:shadow-card-hover">
      <h3 className="text-lg font-bold tracking-tight text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{body}</p>
      {items && items.length > 0 && (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-slate-700">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

export function CtaBand({
  title,
  description,
  primary,
  secondary,
}: {
  title: string
  description: string
  primary: { to: string; label: string }
  secondary?: { to: string; label: string }
}) {
  return (
    <section className="border-b border-slate-200/70 bg-slate-50/80 py-12 sm:py-16">
      <div className="container-page text-center">
        <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-ink-muted sm:text-base">{description}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to={primary.to} className="btn-primary cursor-pointer">
            {primary.label}
          </Link>
          {secondary && (
            <Link to={secondary.to} className="btn-secondary cursor-pointer">
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
