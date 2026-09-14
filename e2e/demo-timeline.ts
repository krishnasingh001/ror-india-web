import fs from 'node:fs'
import path from 'node:path'
import type { Page, TestInfo } from '@playwright/test'

export type TimelineStep = {
  id: string
  at: number
  endedAt?: number
}

export type DemoTimeline = {
  kind: string
  startedAtMs: number
  endedAt?: number
  steps: TimelineStep[]
}

/**
 * Records wall-clock offsets from demo start so voiceover can be placed per scene.
 * Playwright video starts with the browser context; first mark is usually ~0.2–0.8s in.
 */
export function createDemoTimeline(kind: string) {
  const startedAtMs = Date.now()
  const steps: TimelineStep[] = []
  let current: TimelineStep | null = null

  function now() {
    return (Date.now() - startedAtMs) / 1000
  }

  function begin(id: string) {
    if (current && current.endedAt == null) current.endedAt = now()
    current = { id, at: now() }
    steps.push(current)
    return current
  }

  function endCurrent() {
    if (current && current.endedAt == null) current.endedAt = now()
  }

  async function step(
    page: Page,
    id: string,
    fn: () => Promise<void>,
    opts?: { minMs?: number; tailPauseMs?: number },
  ) {
    const minMs = opts?.minMs ?? Number(process.env.DEMO_STEP_MIN_MS || 7500)
    const tailPauseMs = opts?.tailPauseMs ?? Number(process.env.DEMO_STEP_TAIL_MS || 900)
    begin(id)
    const t0 = Date.now()
    await fn()
    const elapsed = Date.now() - t0
    if (elapsed < minMs) await page.waitForTimeout(minMs - elapsed)
    else if (tailPauseMs > 0) await page.waitForTimeout(tailPauseMs)
    endCurrent()
  }

  async function write(testInfo: TestInfo, extra: Record<string, unknown> = {}) {
    endCurrent()
    const payload: DemoTimeline & Record<string, unknown> = {
      kind,
      startedAtMs,
      endedAt: now(),
      steps,
      ...extra,
    }
    const outDir = path.resolve(process.cwd(), 'demo-videos')
    fs.mkdirSync(outDir, { recursive: true })
    const file = path.join(outDir, `.last-timeline-${kind}.json`)
    fs.writeFileSync(file, JSON.stringify(payload, null, 2))
    await testInfo.attach('demo-timeline', {
      body: Buffer.from(JSON.stringify(payload, null, 2)),
      contentType: 'application/json',
    })
    return file
  }

  return { step, begin, endCurrent, write, now, steps }
}
