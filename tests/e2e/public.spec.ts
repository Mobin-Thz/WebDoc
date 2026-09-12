import { expect, test } from '@playwright/test'

test('public shell is keyboard accessible and theme persists', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('webdoc:theme')) localStorage.setItem('webdoc:theme', 'light')
  })
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Technical knowledge')
  await page.getByRole('button', { name: /theme/i }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
})

test('about and missing pages render', async ({ page }) => {
  await page.goto('/about')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Learning should feel navigable')
  await page.goto('/does-not-exist')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('not in the curriculum')
})

test('seeded lesson flow includes search, navigation, code, and local progress', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/search?q=shell')
  await page.getByRole('link', { name: 'Meet the Shell' }).click()
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Getting Started')
  await expect(page.getByRole('navigation', { name: 'On this page' })).toContainText('Meet the shell')
  await page.getByRole('button', { name: 'Copy' }).click()
  await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible()
  await page.getByRole('link', { name: 'Getting Started' }).click()
  await expect(page.getByLabel(/of this chapter visited/)).toContainText('1/2 lessons')
})

test('lesson navigation remains available on a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/lessons/meet-the-shell')
  await expect(page.getByText('Course navigation', { exact: true })).toBeVisible()
  await expect(page.getByText('On this page', { exact: true })).toBeVisible()
})
