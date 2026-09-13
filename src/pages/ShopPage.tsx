import { useDeferredValue, useState } from 'react'
import { ContentSection, PageHero } from '@/components/marketing/PageChrome'

type Category = 'all' | 'books' | 'courses' | 'tools'

type Product = {
  id: string
  category: Exclude<Category, 'all'>
  title: string
  description: string
  badge?: string
  href: string
  cta: string
}

const PRODUCTS: Product[] = [
  {
    id: 'rails-way',
    category: 'books',
    title: 'The Rails Way',
    description: 'A deep guide to Rails conventions, from basics through advanced production patterns.',
    badge: 'Bestseller',
    href: 'https://www.amazon.com/s?k=The+Rails+Way',
    cta: 'View on Amazon',
  },
  {
    id: 'agile-rails',
    category: 'books',
    title: 'Agile Web Development with Rails',
    description: 'Hands-on Rails learning with a full application walkthrough — great for builders.',
    badge: 'Classic',
    href: 'https://pragprog.com/titles/rails7/agile-web-development-with-rails-7/',
    cta: 'View book',
  },
  {
    id: 'practical-ood',
    category: 'books',
    title: 'Practical Object-Oriented Design',
    description: 'Sandi Metz on readable Ruby design — essential for maintainable Rails apps.',
    href: 'https://www.poodr.com/',
    cta: 'Learn more',
  },
  {
    id: 'gorails',
    category: 'courses',
    title: 'GoRails',
    description: 'Short, practical screencasts covering Rails features, Hotwire, and real-world workflows.',
    badge: 'Popular',
    href: 'https://gorails.com/',
    cta: 'Visit GoRails',
  },
  {
    id: 'rails-guides',
    category: 'courses',
    title: 'Official Rails Guides',
    description: 'Free, authoritative documentation maintained by the Rails core team.',
    href: 'https://guides.rubyonrails.org/',
    cta: 'Open guides',
  },
  {
    id: 'ruby-docs',
    category: 'tools',
    title: 'Ruby Documentation',
    description: 'Language reference and standard library docs for everyday Ruby work.',
    href: 'https://www.ruby-lang.org/en/documentation/',
    cta: 'Open docs',
  },
  {
    id: 'rubygems',
    category: 'tools',
    title: 'RubyGems',
    description: 'Discover and publish gems that power the Rails ecosystem.',
    href: 'https://rubygems.org/',
    cta: 'Browse gems',
  },
  {
    id: 'heroku',
    category: 'tools',
    title: 'Heroku for Rails',
    description: 'Deploy and scale Rails apps with a developer-friendly PaaS workflow.',
    href: 'https://www.heroku.com/',
    cta: 'Learn more',
  },
]

const TABS: { id: Category; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'books', label: 'Books' },
  { id: 'courses', label: 'Courses' },
  { id: 'tools', label: 'Tools' },
]

export function ShopPage() {
  const [category, setCategory] = useState<Category>('all')
  const deferredCategory = useDeferredValue(category)
  const items =
    deferredCategory === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.category === deferredCategory)

  return (
    <div>
      <PageHero
        eyebrow="Shop"
        title={
          <>
            Rails resources we <span className="text-brand">recommend</span>
          </>
        }
        description="Curated books, courses, and tools to level up your Ruby on Rails craft. Some links may be affiliate — thanks for supporting ROR World."
      />

      <section className="border-b border-slate-200/70 bg-white py-4">
        <div className="container-page flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategory(tab.id)}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition duration-200 ${
                category === tab.id
                  ? 'bg-brand text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <ContentSection
        title={deferredCategory === 'all' ? 'All resources' : TABS.find((t) => t.id === deferredCategory)?.label || 'Resources'}
        lead="External sites open in a new tab. Prices and availability may change."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((product) => (
            <article
              key={product.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition duration-200 hover:border-brand/25 hover:shadow-card-hover"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                  {product.category}
                </span>
                {product.badge && (
                  <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-bold text-brand">
                    {product.badge}
                  </span>
                )}
              </div>
              <h3 className="mt-4 text-lg font-bold tracking-tight text-ink">{product.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{product.description}</p>
              <a
                href={product.href}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="btn-primary mt-5 w-full cursor-pointer text-center"
              >
                {product.cta}
              </a>
            </article>
          ))}
        </div>
        {items.length === 0 && (
          <p className="text-sm text-ink-muted" role="status">
            No products in this category yet.
          </p>
        )}
      </ContentSection>
    </div>
  )
}
