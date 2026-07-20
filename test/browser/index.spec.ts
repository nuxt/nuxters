import { expect, test } from '@nuxt/test-utils/playwright'

// TODO: figure out how to run these with `@nuxthub/core` module enabled

test('home page', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveScreenshot()
})

test('og image for a Nuxter profile', async ({ request }) => {
  const response = await request.get('/_og/r/hacknug.png')

  expect(response.ok()).toBe(true)
  expect(response.headers()['content-type']).toBe('image/png')
})
