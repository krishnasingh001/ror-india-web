import { expect, test, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { createDemoTimeline } from './demo-timeline'

/**
 * Investor pitch demo — audio-first.
 * Screen actions are paced to a continuous Kokoro narration track
 * (demo-videos/narration/investor-flow.audio.json).
 */
const CANDIDATE_EMAIL = process.env.DEMO_CANDIDATE_EMAIL || 'avinash@rorindia.team'
const CANDIDATE_PASSWORD = process.env.DEMO_CANDIDATE_PASSWORD || 'password123'
const RECRUITER_EMAIL = process.env.DEMO_RECRUITER_EMAIL || 'krishna+1@gmail.com'
const RECRUITER_PASSWORD = process.env.DEMO_RECRUITER_PASSWORD || 'password123'
const stamp = Date.now().toString().slice(-6)

type AudioBeat = { id: string; durationMs: number; text: string }

function loadAudioBeats(): AudioBeat[] {
  const metaPath = path.resolve(process.cwd(), 'demo-videos/narration/investor-flow.audio.json')
  if (!fs.existsSync(metaPath)) {
    throw new Error(
      `Missing ${metaPath}. Run: .venv-kokoro/bin/python scripts/generate-investor-narration.py`,
    )
  }
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')) as { beats: AudioBeat[] }
  return meta.beats
}

async function pause(page: Page, ms = 800) {
  await page.waitForTimeout(ms)
}

async function signIn(page: Page, email: string, password: string) {
  await page.goto('/sign-in')
  await expect(page.getByRole('heading', { name: /sign in to ror world/i })).toBeVisible()
  await page.locator('#email').fill(email)
  await page.locator('#password').fill(password)
  await page.getByRole('button', { name: /^sign in$/i }).click()
  await page.waitForURL(/\/dashboard/, { timeout: 45_000 })
}

async function logout(page: Page) {
  for (let i = 0; i < 3; i += 1) {
    if (await page.getByRole('dialog').isVisible().catch(() => false)) {
      await page.keyboard.press('Escape')
      await pause(page, 300)
      const closeBtn = page.getByRole('dialog').getByRole('button', { name: /close/i }).last()
      if (await closeBtn.isVisible().catch(() => false)) {
        await closeBtn.click({ force: true })
        await pause(page, 300)
      }
    } else break
  }
  await page.locator('header button[aria-haspopup="menu"]').click({ force: true })
  await page.getByRole('menuitem', { name: /logout/i }).click()
  await expect(page.getByRole('banner').getByRole('link', { name: /sign in/i })).toBeVisible({
    timeout: 15_000,
  })
}

async function openSelectAndChoose(page: Page, trigger: ReturnType<Page['locator']>, optionText?: RegExp) {
  await trigger.click()
  const option = optionText
    ? page.getByRole('option').filter({ hasText: optionText }).first()
    : page.getByRole('option').nth(1)
  if (await option.isVisible().catch(() => false)) await option.click()
  else await page.keyboard.press('Escape')
}

test.describe.configure({ mode: 'serial' })

test('ROR World investor demo (audio-first)', async ({ page }, testInfo) => {
  test.setTimeout(12 * 60 * 1000)
  const beats = loadAudioBeats()
  const byId = Object.fromEntries(beats.map((b) => [b.id, b]))
  const timeline = createDemoTimeline('client-investor')

  /** Run UI actions while holding the scene for the narration duration (+ cushion). */
  async function narrated(id: string, fn: () => Promise<void>) {
    const beat = byId[id]
    if (!beat) throw new Error(`Unknown narration beat: ${id}`)
    const holdMs = beat.durationMs + Number(process.env.DEMO_AUDIO_CUSHION_MS || 450)
    await timeline.step(page, id, fn, { minMs: holdMs, tailPauseMs: 0 })
  }

  // ── Opening ──────────────────────────────────────────────────────────
  await narrated('welcome', async () => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /find your next/i })).toBeVisible()
    await expect(page.getByText(/ruby on rails jobs worldwide/i)).toBeVisible()
    await pause(page, 900)
  })

  await narrated('landing', async () => {
    await page.locator('#keywords').fill('Rails')
    await page.getByRole('button', { name: /^search$/i }).click()
    await pause(page, 1200)
    await page.mouse.wheel(0, 420)
    await pause(page, 800)
  })

  await narrated('companies', async () => {
    await page.goto('/companies')
    await expect(page.getByRole('heading').first()).toBeVisible()
    await pause(page, 900)
    const company = page.locator('a[href^="/companies/"]').first()
    if (await company.isVisible().catch(() => false)) {
      await company.click()
      await page.waitForURL(/\/companies\/\d+/)
      await pause(page, 1000)
    }
  })

  // ── Candidate loop ───────────────────────────────────────────────────
  await narrated('candidate_hub', async () => {
    await signIn(page, CANDIDATE_EMAIL, CANDIDATE_PASSWORD)
    await expect(page.getByRole('heading', { name: /job search hub|dashboard/i })).toBeVisible()
    await page.mouse.wheel(0, 280)
    await pause(page, 700)
  })

  await narrated('search_apply', async () => {
    await page.goto('/')
    await page.locator('#keywords').fill('Rails')
    await page.getByRole('button', { name: /^search$/i }).click()
    await pause(page, 1000)
    const jobLink = page.locator('a[href^="/jobs/"]').first()
    await expect(jobLink).toBeVisible({ timeout: 20_000 })
    await jobLink.click()
    await page.waitForURL(/\/jobs\/\d+/)
    await pause(page, 900)

    const apply = page.getByRole('button', { name: /apply now|^apply$|applied/i }).first()
    if (await apply.isVisible().catch(() => false)) {
      const label = ((await apply.textContent()) || '').toLowerCase()
      if (!label.includes('applied')) {
        await apply.click()
        await pause(page, 1000)
      }
    }
    const save = page.getByRole('button', { name: /save job|^saved$/i }).first()
    if (await save.isVisible().catch(() => false)) {
      const label = ((await save.textContent()) || '').toLowerCase()
      if (!label.includes('saved')) await save.click()
    }
  })

  await narrated('track_ats', async () => {
    await page.goto('/track-applications')
    await expect(page.getByRole('heading', { name: /track applications/i })).toBeVisible()
    await pause(page, 800)
    await page.getByRole('button', { name: /^\+?\s*track application$/i }).click()
    const addDialog = page.getByRole('dialog')
    await expect(addDialog).toBeVisible()
    const fields = addDialog.locator('input.jira-input, input')
    await fields.nth(0).fill(`Demo Rails Role ${stamp}`)
    await fields.nth(1).fill('Acme Rails Inc')
    await addDialog.getByRole('button', { name: /^track application$/i }).click()
    await pause(page, 1200)
    const card = page.locator('article').filter({ hasText: /Demo Rails Role/i }).first()
    if (await card.isVisible().catch(() => false)) {
      await card.click()
      const detail = page.getByRole('dialog')
      await expect(detail).toBeVisible()
      await pause(page, 1200)
      await detail.getByRole('button', { name: /close/i }).last().click({ force: true })
      await expect(detail).toBeHidden({ timeout: 10_000 })
    }
    await logout(page)
  })

  // ── Recruiter loop ───────────────────────────────────────────────────
  await narrated('hiring_switch', async () => {
    await signIn(page, RECRUITER_EMAIL, RECRUITER_PASSWORD)
    await expect(page.getByRole('heading', { name: /hiring dashboard/i })).toBeVisible()
    await expect(page.getByText(/posted jobs|applications|open talent/i).first()).toBeVisible()
    await page.mouse.wheel(0, 300)
  })

  await narrated('profile_company_job', async () => {
    await page.goto('/recruiter/profile')
    await expect(page.getByRole('heading', { name: /your recruiter profile/i })).toBeVisible()
    await page.getByPlaceholder(/talent partner/i).fill('Talent Partner · ROR World')
    await page
      .getByPlaceholder(/short intro about the roles/i)
      .fill('Investor demo: hiring Rails talent with ROR World.')
    await page.getByRole('button', { name: /save profile/i }).click()
    await expect(page.getByText(/profile (saved|updated)|updated successfully/i)).toBeVisible()

    await page.goto('/companies/new')
    await page.locator('#company-name').fill(`Pitch Labs ${stamp}`)
    await page.locator('#company-website').fill(`https://pitch-labs-${stamp}.example.com`)
    await page.locator('#company-hq').fill('Bangalore')
    await page.locator('#company-type').fill('Product / SaaS')
    await page.getByRole('button', { name: /create company/i }).click()
    await page.waitForURL(/\/companies\/\d+/, { timeout: 25_000 })

    await page.goto('/jobs/new')
    await expect(page.getByRole('heading', { name: /post a job/i })).toBeVisible()
    await page.getByPlaceholder('Senior Ruby on Rails Engineer').fill(`Pitch Rails Engineer ${stamp}`)
    await page
      .getByPlaceholder(/role overview, responsibilities/i)
      .fill('Investor demo: Ruby on Rails, Hotwire, PostgreSQL.')
    await page.getByPlaceholder('Remote / Bangalore').fill('Remote / Bangalore')
    await page.getByPlaceholder('Ruby, Rails, PostgreSQL, Hotwire').fill('Ruby on Rails, PostgreSQL, Hotwire')
    await page.getByPlaceholder('hiring@company.com').fill(RECRUITER_EMAIL)
    const salaryInputs = page.locator('input[type="number"]')
    await salaryInputs.nth(0).fill('1500000')
    await salaryInputs.nth(1).fill('2500000')
    const selects = page.locator('button[aria-haspopup="listbox"]')
    if ((await selects.count()) >= 2) await openSelectAndChoose(page, selects.nth(1))
    if ((await selects.count()) >= 3) {
      await openSelectAndChoose(page, selects.nth(2), new RegExp(`Pitch Labs ${stamp}|RoR India`, 'i'))
    }
    await page.getByRole('button', { name: /publish job/i }).click()
    await page.waitForURL(/\/(my-jobs|jobs\/\d+)/, { timeout: 25_000 })
  })

  await narrated('applications', async () => {
    await page.goto('/my-jobs')
    await expect(page.getByRole('heading', { name: /my posted jobs/i })).toBeVisible()
    await pause(page, 700)
    await page.goto('/recruiter/applications')
    await expect(page.getByRole('heading').first()).toBeVisible()
    await pause(page, 1000)
    const card = page.locator('article[role="button"]').first()
    await expect(card).toBeVisible({ timeout: 25_000 })
    await card.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await pause(page, 1200)
    await page.mouse.wheel(0, 240)

    const statusControl = dialog.locator('button[aria-haspopup="listbox"]').first()
    if (await statusControl.isVisible().catch(() => false)) {
      await statusControl.click()
      const shortlisted = page.getByRole('option', { name: /shortlisted/i })
      if (await shortlisted.isVisible().catch(() => false)) await shortlisted.click()
      else await page.keyboard.press('Escape')
      await pause(page, 700)
    }
    const commentBox = dialog.getByPlaceholder(/add a comment/i)
    if (await commentBox.isVisible().catch(() => false)) {
      await commentBox.fill('Strong Rails fit — move to technical screen.')
      await dialog.getByRole('button', { name: /^comment$/i }).click()
      await expect(dialog.getByText(/strong rails fit/i)).toBeVisible()
    }
    await dialog.locator('button[aria-label="Close"]').last().click({ force: true })
    await expect(dialog).toBeHidden({ timeout: 10_000 })
  })

  await narrated('talent_close', async () => {
    await page.goto('/talent')
    await expect(page.getByRole('heading').first()).toBeVisible()
    await pause(page, 900)
    const talentLink = page.locator('a[href^="/talent/"]').first()
    await expect(talentLink).toBeVisible({ timeout: 20_000 })
    await talentLink.click()
    await page.waitForURL(/\/talent\/\d+/)
    await page.mouse.wheel(0, 280)
    const saveBtn = page.getByRole('button', { name: /save profile|^save$|^saved$/i })
    if (await saveBtn.isVisible().catch(() => false)) {
      const label = (await saveBtn.textContent()) || ''
      if (!/saved/i.test(label)) await saveBtn.click()
    }
    await page.goto('/saved-profiles')
    await expect(page.getByRole('heading', { name: /saved profiles/i })).toBeVisible()
    await pause(page, 900)
    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { name: /hiring dashboard/i })).toBeVisible()
    await pause(page, 1200)
  })

  const outDir = path.resolve(process.cwd(), 'demo-videos')
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(
    path.join(outDir, '.last-run.json'),
    JSON.stringify({ kind: 'investor-flow', stamp, engine: 'kokoro' }, null, 2),
  )
  const timelineFile = await timeline.write(testInfo, { stamp, audioFirst: true })
  await testInfo.attach('pitch-demo-info', {
    body: `Investor demo finished (audio-first).\nTimeline: ${timelineFile}\nMux: npm run demo:pitch:flow\n`,
    contentType: 'text/plain',
  })
})
