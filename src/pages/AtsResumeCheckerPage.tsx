import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { AtsCheckReport, AtsCheckCategory, AtsCheckItem } from '@/types'

type Phase = 'idle' | 'scanning' | 'report' | 'error'

export function AtsResumeCheckerPage() {
  const { user } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<AtsCheckReport | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const [targetRole, setTargetRole] = useState('')

  const runCheck = useCallback(async (file: File) => {
    setError(null)
    setPhase('scanning')
    setReport(null)
    try {
      const res = await api.checkResume(file, targetRole)
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Could not analyze resume.')
      }
      setReport(res.data)
      setPhase('report')
      const firstIssue = res.data.categories.find((c) => c.points_to_gain > 0)
      setOpenId(firstIssue?.id || res.data.categories[0]?.id || null)
    } catch (e: unknown) {
      const err = e as { message?: string }
      setError(err.message || 'Could not analyze this resume.')
      setPhase('error')
    }
  }, [targetRole])

  function onFile(file: File | undefined | null) {
    if (!file) return
    const name = file.name.toLowerCase()
    if (!name.endsWith('.pdf') && !name.endsWith('.docx')) {
      setError('Please upload a PDF or DOCX resume.')
      setPhase('error')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Resume must be 5MB or smaller.')
      setPhase('error')
      return
    }
    void runCheck(file)
  }

  function reset() {
    setPhase('idle')
    setReport(null)
    setError(null)
    setOpenId(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  if (phase === 'report' && report) {
    return (
      <ReportView
        report={report}
        openId={openId}
        onToggle={(id) => setOpenId((prev) => (prev === id ? null : id))}
        onReset={reset}
        signedIn={Boolean(user)}
      />
    )
  }

  return (
    <div>
      <section className="hero-surface">
        <div className="container-page py-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Free tool</p>
          <h1 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            ATS Resume Checker
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-ink-muted sm:text-base">
            Upload a PDF, get a score out of 100, see failed checks across 10 ATS categories, and fix
            what blocks recruiters’ software from reading your Rails resume.
          </p>
        </div>
      </section>

      <section className="container-page grid gap-8 pb-16 pt-2 lg:grid-cols-2 lg:gap-10">
        <div>
          <label htmlFor="target-role" className="mb-2 block text-sm font-semibold text-ink">
            Target role <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <textarea
            id="target-role"
            rows={3}
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="Paste a job title or short JD snippet — e.g. Senior Rails Engineer, Sidekiq, PostgreSQL, remote…"
            className="input-field min-h-[5.5rem] resize-y"
          />
          <p className="mt-1.5 text-xs text-ink-muted">
            Adds a Target role fit category with keyword coverage. Leave blank for a general ATS check.
          </p>

          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              onFile(e.dataTransfer.files?.[0])
            }}
            className={[
              'mt-4 flex min-h-[260px] flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white px-6 py-10 text-center transition-colors',
              dragOver ? 'border-brand bg-brand-soft/40' : 'border-slate-300',
              phase === 'scanning' ? 'opacity-70' : '',
            ].join(' ')}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <UploadIcon />
            </div>
            <p className="mt-4 text-base font-semibold text-ink">
              {phase === 'scanning' ? 'Scanning your resume…' : 'Drop your resume here'}
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              {phase === 'scanning'
                ? 'Running 40+ ATS checks — usually a few seconds.'
                : 'Your score and checklist appear in seconds.'}
            </p>
            <button
              type="button"
              disabled={phase === 'scanning'}
              onClick={() => inputRef.current?.click()}
              className="btn-primary mt-6 cursor-pointer"
            >
              {phase === 'scanning' ? 'Analyzing…' : 'Upload Your Resume'}
            </button>
            <p className="mt-3 text-xs text-ink-soft">PDF or DOCX · max 5MB</p>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </div>

          {(phase === 'error' || error) && (
            <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {error}
            </div>
          )}

          <ul className="mt-6 space-y-2.5 text-sm text-ink-muted">
            {[
              '40+ checks across 10–11 ATS categories',
              'Calibrated so strong resumes score in the mid–high 80s+',
              'Optional target-role keyword fit',
              'File analyzed in memory — not stored from this tool',
              'Rescan anytime after you edit',
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-0.5 text-emerald-600" aria-hidden>
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <PreviewCard />
      </section>

      <section className="border-t border-slate-200 bg-white py-12">
        <div className="container-page">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            Why good resumes get no reply
          </p>
          <h2 className="mt-2 text-2xl font-bold text-ink">Software reads your resume first</h2>
          <p className="mt-3 max-w-2xl text-sm text-ink-muted">
            Most companies filter with an ATS before a human looks. Tables, missing dates, vague
            bullets, and weak contact headers quietly drop strong Rails candidates. This checker
            flags the same classes of issues recruiters’ tools struggle with.
          </p>
        </div>
      </section>
    </div>
  )
}

function PreviewCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-sm font-medium text-ink">sample-rails-resume.pdf</p>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
          ATS report
        </span>
      </div>
      <div className="mt-6 flex items-center gap-5">
        <ScoreRing score={78} size={96} />
        <div>
          <p className="text-sm font-semibold text-ink">ATS score</p>
          <p className="mt-1 text-sm text-ink-muted">Close. 4 fixes left.</p>
          <p className="mt-1 text-xs text-ink-soft">30 of 45 checks passed</p>
        </div>
      </div>
      <ul className="mt-6 space-y-3">
        {[
          { label: 'ATS essentials', score: 92 },
          { label: 'Contact info', score: 100 },
          { label: 'Sections', score: 75 },
          { label: 'Content quality', score: 58 },
          { label: 'Skills & dates', score: 80 },
        ].map((row) => (
          <li key={row.label}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-medium text-ink">{row.label}</span>
              <span className="tabular-nums text-ink-muted">{row.score}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${row.score >= 80 ? 'bg-emerald-500' : row.score >= 65 ? 'bg-amber-400' : 'bg-brand'}`}
                style={{ width: `${row.score}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      <ul className="mt-6 space-y-2 border-t border-slate-100 pt-4 text-sm">
        <li className="flex items-center gap-2 text-emerald-700">
          <StatusDot status="pass" /> Single-column layout
        </li>
        <li className="flex items-center gap-2 text-brand">
          <StatusDot status="fail" /> Parseable employment dates
        </li>
        <li className="flex items-center gap-2 text-amber-700">
          <StatusDot status="warn" /> Quantified achievements
        </li>
      </ul>
    </div>
  )
}

function ReportView({
  report,
  openId,
  onToggle,
  onReset,
  signedIn,
}: {
  report: AtsCheckReport
  openId: string | null
  onToggle: (id: string) => void
  onReset: () => void
  signedIn: boolean
}) {
  return (
    <div className="container-page grid gap-8 py-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:py-10">
      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-card lg:sticky lg:top-24">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-soft">ATS score</p>
        <div className="mt-3 flex justify-center">
          <ScoreRing score={report.overall_score} size={140} />
        </div>
        <p className="mt-4 text-center text-sm font-semibold text-ink">{report.summary}</p>
        <p className="mt-1 text-center text-xs text-ink-muted">
          {report.passed_count} of {report.total_checks} checks passed
        </p>

        <nav className="mt-6 space-y-1 border-t border-slate-100 pt-4">
          {report.categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onToggle(cat.id)}
              className={[
                'flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                openId === cat.id ? 'bg-brand-soft text-brand' : 'text-ink hover:bg-slate-50',
              ].join(' ')}
            >
              <span className="font-medium">{cat.label}</span>
              <span className="tabular-nums text-xs opacity-80">{cat.score}</span>
            </button>
          ))}
        </nav>

        <div className="mt-6 space-y-2 border-t border-slate-100 pt-4">
          {!signedIn ? (
            <Link to="/sign-up" state={{ from: '/tools/ats-resume-checker' }} className="btn-primary flex w-full justify-center">
              Create free profile
            </Link>
          ) : (
            <Link to="/profile/edit" className="btn-primary flex w-full justify-center">
              Update profile resume
            </Link>
          )}
          <button type="button" onClick={onReset} className="btn-secondary flex w-full cursor-pointer justify-center">
            Check another resume
          </button>
        </div>
        {report.filename && (
          <p className="mt-4 truncate text-center text-[11px] text-ink-soft" title={report.filename}>
            {report.filename}
          </p>
        )}
      </aside>

      <div>
        <p className="text-sm text-ink-muted">
          Results ranked by impact. Expand a category to see what’s working and where you lose
          points.
        </p>
        <div className="mt-5 space-y-3">
          {report.categories.map((cat) => (
            <CategoryPanel
              key={cat.id}
              category={cat}
              open={openId === cat.id}
              onToggle={() => onToggle(cat.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function CategoryPanel({
  category,
  open,
  onToggle,
}: {
  category: AtsCheckCategory
  open: boolean
  onToggle: () => void
}) {
  const working = category.checks.filter((c) => c.status === 'pass')
  const losing = category.checks.filter((c) => c.status !== 'pass')

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center gap-3 px-4 py-4 text-left sm:px-5"
      >
        <ScorePill score={category.score} />
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-ink">{category.label}</h2>
          {category.points_to_gain > 0 ? (
            <p className="text-xs text-ink-muted">+{category.points_to_gain} pts to gain</p>
          ) : (
            <p className="text-xs text-emerald-700">Looking strong</p>
          )}
        </div>
        <span className="text-ink-soft">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="grid gap-4 border-t border-slate-100 px-4 py-4 sm:grid-cols-2 sm:px-5">
          <CheckGroup title="Where you lose points" items={losing} empty="Nothing critical here." />
          <CheckGroup title="Working for you" items={working} empty="No passes in this category yet." />
        </div>
      )}
    </article>
  )
}

function CheckGroup({
  title,
  items,
  empty,
}: {
  title: string
  items: AtsCheckItem[]
  empty: string
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">{title}</p>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-ink-muted">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {items.map((item) => (
            <li key={item.id} className="rounded-xl bg-slate-50 px-3 py-2.5">
              <div className="flex items-start gap-2">
                <StatusDot status={item.status} />
                <div>
                  <p className="text-sm font-medium text-ink">{item.label}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">{item.detail}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ScoreRing({ score, size }: { score: number; size: number }) {
  const stroke = size > 120 ? 10 : 8
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (score / 100) * c
  const color = score >= 85 ? '#10b981' : score >= 70 ? '#f59e0b' : '#dc2626'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums text-ink" style={{ fontSize: size > 120 ? 36 : 28 }}>
          {score}
        </span>
      </div>
    </div>
  )
}

function ScorePill({ score }: { score: number }) {
  const color =
    score >= 85 ? 'bg-emerald-50 text-emerald-700' : score >= 70 ? 'bg-amber-50 text-amber-800' : 'bg-brand-soft text-brand'
  return (
    <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums ${color}`}>
      {score}
    </span>
  )
}

function StatusDot({ status }: { status: AtsCheckItem['status'] }) {
  if (status === 'pass') {
    return <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-[10px] text-emerald-700">✓</span>
  }
  if (status === 'warn') {
    return <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-100 text-[10px] text-amber-700">!</span>
  }
  return <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-brand-soft text-[10px] text-brand">×</span>
}

function UploadIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M12 16V7m0 0 4 4m-4-4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5" strokeLinecap="round" />
    </svg>
  )
}
