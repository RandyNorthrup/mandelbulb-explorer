import { defineConfig, devices } from '@playwright/test'

const DEV_HOST = '127.0.0.1'
const DEV_PORT = 5173
const DEV_URL = `http://${DEV_HOST}:${String(DEV_PORT)}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: process.env['CI'] !== undefined,
  retries: process.env['CI'] === undefined ? 0 : 2,
  use: {
    baseURL: DEV_URL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `npm run dev -- --host ${DEV_HOST} --port ${String(DEV_PORT)}`,
    url: DEV_URL,
    reuseExistingServer: process.env['CI'] === undefined,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
