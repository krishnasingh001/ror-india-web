import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export type LegalSection = {
  id: string
  title: string
  body: ReactNode
}

type LegalDocumentProps = {
  title: string
  updated: string
  intro?: string
  sections: LegalSection[]
}

export function LegalDocument({ title, updated, intro, sections }: LegalDocumentProps) {
  return (
    <div>
      <section className="hero-surface">
        <div className="container-page py-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Legal</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-ink-muted">Last updated: {updated}</p>
          {intro && <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-700 sm:text-base">{intro}</p>}
        </div>
      </section>

      <div className="container-page py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14">
          <nav aria-label="On this page" className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">On this page</p>
            <ol className="mt-3 space-y-2">
              {sections.map((section, i) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="cursor-pointer text-sm text-slate-600 transition hover:text-brand"
                  >
                    {i + 1}. {section.title}
                  </a>
                </li>
              ))}
            </ol>
            <Link to="/sitemap" className="mt-6 inline-block text-sm font-semibold text-brand hover:text-brand-hover">
              View sitemap →
            </Link>
          </nav>

          <article className="max-w-3xl space-y-10">
            {sections.map((section, i) => (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <h2 className="text-xl font-bold tracking-tight text-ink">
                  {i + 1}. {section.title}
                </h2>
                <div className="prose-legal mt-3 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-[15px]">
                  {section.body}
                </div>
              </section>
            ))}
          </article>
        </div>
      </div>
    </div>
  )
}
