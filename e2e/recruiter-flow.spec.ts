import { expect, test, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { createDemoTimeline } from './demo-timeline'

const EMAIL = process.env.DEMO_RECRUITER_EMAIL || 'krishna+1@gmail.com'
const PASSWORD = process.env.DEMO_RECRUITER_PASSWORD || 'password123'
const stamp = Date.now().toString().slice(-6)

async function pause(page: Page, ms = 1100) {
  await page.waitForTimeout(ms)
}

async function openSelectAndChoose(page: Page, trigger: ReturnType<Page['locator']>, optionText?: RegExp) {
  await trigger.click()
  const option = optionText
    ? page.getByRole('option').filter({ hasText: optionText }).first()
    : page.getByRole('option').nth(1)
  if (await option.isVisible().catch(() => false)) {
    await option.click()
  } else {
    await page.keyboard.press('Escape')
  }
}

test.describe.configure({ mode: 'serial' })

test('recruiter product demo (recorded)', async ({ page }, testInfo) => {
  test.setTimeout(6 * 60 * 1000)
  const timeline = createDemoTimeline('recruiter')
  const step = (id: string, fn: () => Promise<void>) => timeline.step(page, id, fn)

  await step('Sign in as recruiter', async () => {
    await page.goto('/sign-in')
    await expect(page.getByRole('heading', { name: /sign in to ror world/i })).toBeVisible()
    await page.locator('#email').fill(EMAIL)
    await page.locator('#password').fill(PASSWORD)
    await page.getByRole('button', { name: /^sign in$/i }).click()
    await page.waitForURL(/\/dashboard/)
    await expect(page.getByRole('heading', { name: /hiring dashboard/i })).toBeVisible()
  })

  await step('Hiring dashboard overview', async () => {
    await expect(page.getByText(/posted jobs/i).first()).toBeVisible()
    await page.mouse.wheel(0, 360)
  })

  await step('Update recruiter profile', async () => {
    await page.goto('/recruiter/profile')
    await expect(page.getByRole('heading', { name: /your recruiter profile/i })).toBeVisible()
    await page.getByPlaceholder(/talent partner/i).fill('Talent Partner · Rails Hiring')
    await page
      .getByPlaceholder(/short intro about the roles/i)
      .fill('Hiring Rails engineers across India. Demo recording — open to referrals.')
    await page.getByRole('button', { name: /save profile/i }).click()
    await expect(page.getByText(/profile (saved|updated)|updated successfully/i)).toBeVisible()
  })

  await step('Add a company', async () => {
    await page.goto('/companies/new')
    await expect(page.getByRole('heading', { name: /add a company/i })).toBeVisible()
    await page.locator('#company-name').fill(`Demo Rails Labs ${stamp}`)
    await page.locator('#company-website').fill(`https://demo-rails-labs-${stamp}.example.com`)
    await page.locator('#company-hq').fill('Bangalore / Remote')
    await page.locator('#company-type').fill('SaaS / Product')
    await page.getByRole('button', { name: /create company/i }).click()
    await page.waitForURL(/\/companies\/\d+/, { timeout: 25_000 })
  })

  await step('Post a job', async () => {
    await page.goto('/jobs/new')
    await expect(page.getByRole('heading', { name: /post a job/i })).toBeVisible()

    await page.getByPlaceholder('Senior Ruby on Rails Engineer').fill(`Demo Rails Engineer ${stamp}`)
    await page
      .getByPlaceholder(/role overview, responsibilities/i)
      .fill(
        'We are hiring a Ruby on Rails engineer for our product team. Strong PostgreSQL and Hotwire experience preferred.',
      )
    await page.getByPlaceholder('Remote / Bangalore').fill('Bangalore / Remote')
    await page.getByPlaceholder('Ruby, Rails, PostgreSQL, Hotwire').fill('Ruby on Rails, PostgreSQL, React, RSpec')
    await page.getByPlaceholder('hiring@company.com').fill(EMAIL)

    const salaryInputs = page.locator('input[type="number"]')
    await salaryInputs.nth(0).fill('1200000')
    await salaryInputs.nth(1).fill('2000000')

    const selectTriggers = page.locator('button[aria-haspopup="listbox"]')
    if ((await selectTriggers.count()) >= 2) {
      await openSelectAndChoose(page, selectTriggers.nth(1))
    }
    if ((await selectTriggers.count()) >= 3) {
      await openSelectAndChoose(page, selectTriggers.nth(2), new RegExp(`Demo Rails Labs ${stamp}|RoR India`, 'i'))
    }

    await page.getByRole('button', { name: /publish job/i }).click()
    await page.waitForURL(/\/(my-jobs|jobs\/\d+)/, { timeout: 25_000 })
  })

  await step('Browse my jobs', async () => {
    await page.goto('/my-jobs')
    await expect(page.getByRole('heading', { name: /my posted jobs/i })).toBeVisible()
    await expect(page.getByText(new RegExp(`Demo Rails Engineer ${stamp}`, 'i')).first()).toBeVisible()
    const next = page.getByRole('button', { name: /^next$/i })
    if (await next.isEnabled().catch(() => false)) {
      await next.click()
      await pause(page, 700)
      await page.getByRole('button', { name: /^prev$/i }).click()
    }
  })

  await step('Applications board + applicant modal', async () => {
    await page.goto('/recruiter/applications')
    await expect(page.getByRole('heading').first()).toBeVisible()
    await pause(page, 1400)

    const card = page.locator('article[role="button"]').first()
    await expect(card).toBeVisible({ timeout: 25_000 })
    await card.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await pause(page, 1400)

    const statusControl = dialog.locator('button[aria-haspopup="listbox"]').first()
    if (await statusControl.isVisible().catch(() => false)) {
      await statusControl.click()
      const reviewing = page.getByRole('option', { name: /reviewing/i })
      if (await reviewing.isVisible().catch(() => false)) await reviewing.click()
      else await page.keyboard.press('Escape')
      await pause(page, 900)
    }

    const commentBox = dialog.getByPlaceholder(/add a comment/i)
    if (await commentBox.isVisible().catch(() => false)) {
      await commentBox.fill('Strong Rails background — schedule a technical screen this week.')
      await dialog.getByRole('button', { name: /^comment$/i }).click()
      await expect(dialog.getByText(/strong rails background/i)).toBeVisible()
    }

    await dialog.locator('button[aria-label="Close"]').last().click({ force: true })
    await expect(dialog).toBeHidden({ timeout: 10_000 })
  })

  await step('Browse talent and save a profile', async () => {
    await page.goto('/talent')
    await expect(page.getByRole('heading').first()).toBeVisible()
    await pause(page, 1200)

    const talentLink = page.locator('a[href^="/talent/"]').first()
    await expect(talentLink).toBeVisible({ timeout: 20_000 })
    await talentLink.click()
    await page.waitForURL(/\/talent\/\d+/)

    const saveBtn = page.getByRole('button', { name: /save profile|^save$|^saved$/i })
    if (await saveBtn.isVisible().catch(() => false)) {
      const label = (await saveBtn.textContent()) || ''
      if (!/saved/i.test(label)) await saveBtn.click()
      await pause(page, 900)
    }
  })

  await step('Saved profiles', async () => {
    await page.goto('/saved-profiles')
    await expect(page.getByRole('heading', { name: /saved profiles/i })).toBeVisible()
    await pause(page, 1400)
  })

  await step('Return to dashboard', async () => {
    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { name: /hiring dashboard/i })).toBeVisible()
    await pause(page, 1400)
  })

  const outDir = path.resolve(process.cwd(), 'demo-videos')
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, '.last-run.json'), JSON.stringify({ stamp, email: EMAIL }, null, 2))
  const timelineFile = await timeline.write(testInfo, { stamp, email: EMAIL })
  await testInfo.attach('demo-info', {
    body: `Demo finished for ${EMAIL}.\nTimeline: ${timelineFile}\nCollect with: npm run demo:recruiter:collect\n`,
    contentType: 'text/plain',
  })
})
