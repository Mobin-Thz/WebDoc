import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'corepack pnpm dev',
    reuseExistingServer: true,
    timeout: 120_000,
    url: 'http://localhost:3000',
  },
})
