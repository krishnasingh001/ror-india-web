import { defineConfig } from '@playwright/test'

/**
 * Product demo recorder.
 * Requires local Vite (5173) + Rails API (3000).
 *
 * Viewport MUST match video.size or Playwright letterboxes (black bars).
 * Avoid devices['Desktop Chrome'] — it forces 1280x720 and a Windows UA.
 */
const VIEWPORT = { width: 1440, height: 900 }

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 5 * 60 * 1000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'demo-report' }]],
  outputDir: 'demo-output',
  use: {
    baseURL: process.env.DEMO_BASE_URL || 'http://localhost:5173',
    browserName: 'chromium',
    viewport: VIEWPORT,
    screen: VIEWPORT,
    deviceScaleFactor: 1,
    video: {
      mode: 'on',
      size: VIEWPORT,
    },
    trace: 'on',
    screenshot: 'on',
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
    launchOptions: {
      slowMo: Number(process.env.DEMO_SLOW_MO || 450),
    },
  },
  projects: [{ name: 'chromium' }],
})
