import config from '@payload-config'
import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

let payload: Payload
let userID: number
const email = `e2e-${Date.now()}@example.com`
const password = 'local-e2e-password-123'

test.beforeAll(async () => {
  payload = await getPayload({ config })
  const user = await payload.create({ collection: 'users', overrideAccess: true, data: { email, name: 'E2E Administrator', password } })
  userID = user.id
})

test.afterAll(async () => {
  if (userID) await payload.delete({ collection: 'users', id: userID, overrideAccess: true })
  await payload?.destroy()
})

test('administrator can sign in and open an authenticated preview', async ({ page }) => {
  await page.goto('/admin')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: /login/i }).click()
  await expect(page.getByRole('link', { name: 'Show all Subjects' })).toBeVisible()

  await page.goto('/api/preview?secret=development-preview-secret&path=%2Flessons%2Fmeet-the-shell')
  await expect(page.getByRole('heading', { level: 1, name: 'Meet the Shell' })).toBeVisible()
})
