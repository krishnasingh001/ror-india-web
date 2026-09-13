type Props = {
  page: number
  totalPages: number
  totalCount: number
  perPage: number
  onChange: (page: number) => void
  label?: string
}

function pageWindow(current: number, total: number): Array<number | '…'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages = new Set<number>([1, total, current, current - 1, current + 1])
  if (current <= 3) {
    pages.add(2)
    pages.add(3)
    pages.add(4)
  }
  if (current >= total - 2) {
    pages.add(total - 1)
    pages.add(total - 2)
    pages.add(total - 3)
  }

  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const out: Array<number | '…'> = []
  for (let i = 0; i < sorted.length; i += 1) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push('…')
    out.push(sorted[i])
  }
  return out
}

export function Pagination({
  page,
  totalPages,
  totalCount,
  perPage,
  onChange,
  label = 'results',
}: Props) {
  if (totalPages <= 1 || totalCount === 0) return null

  const from = (page - 1) * perPage + 1
  const to = Math.min(page * perPage, totalCount)
  const items = pageWindow(page, totalPages)

  return (
    <nav
      className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 sm:flex-row"
      aria-label="Pagination"
    >
      <p className="text-sm text-slate-600">
        Showing{' '}
        <span className="font-semibold text-ink">
          {from}–{to}
        </span>{' '}
        of <span className="font-semibold text-ink">{totalCount}</span> {label}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <button
          type="button"
          className="btn-secondary !px-3 !py-2 text-sm disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="Previous page"
        >
          Prev
        </button>

        {items.map((item, idx) =>
          item === '…' ? (
            <span key={`e-${idx}`} className="px-1.5 text-sm text-slate-400" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              aria-label={`Page ${item}`}
              aria-current={item === page ? 'page' : undefined}
              className={[
                'inline-flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-xl px-3 text-sm font-semibold transition duration-200 ease-out',
                item === page
                  ? 'bg-brand text-white'
                  : 'border border-slate-300 bg-white text-ink hover:border-brand-border hover:bg-brand-soft hover:text-brand',
              ].join(' ')}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          className="btn-secondary !px-3 !py-2 text-sm disabled:opacity-40"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </nav>
  )
}
