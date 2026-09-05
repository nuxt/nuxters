import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  contextOptions: { reducedMotion: 'reduce' },
  nuxt: {
    nuxtConfig: { runtimeConfig: { sessionPassword: 'test-session-password-at-least-32-characters' } },
    setupTimeout: 600_000,
  },
})
test.setTimeout(60_000)

test('homepage offers a compact globe and a link to the people directory', async ({ page, goto }) => {
  await goto('/', { waitUntil: 'hydration' })
  const globe = page.locator('.home-people .people-globe')
  await expect(globe).toHaveAttribute('data-ready', 'true')
  await expect(globe.locator('canvas')).toBeVisible()
  await expect(globe.getByRole('button', { name: 'Zoom in', exact: true })).toHaveCount(0)
  expect(await globe.locator('.people-globe__marker').count()).toBeLessThanOrEqual(64)
  await page.getByRole('link', { name: 'Explore the community' }).click()
  await expect(page).toHaveURL(/\/people$/)
  await expect(page.getByRole('heading', { name: 'People of Nuxt' })).toBeVisible()
})

test('directory filters, paginates and restores filters through browser history', async ({ page, goto }) => {
  await goto('/people', { waitUntil: 'hydration' })
  const list = page.getByRole('list', { name: 'Contributors', exact: true })
  await expect(list.locator('li')).toHaveCount(24)
  const first = await list.locator('a').first().getAttribute('href')
  await page.getByRole('button', { name: 'Next page', exact: true }).click()
  await expect(page).toHaveURL(/page=2/)
  await expect(list.locator('a').first()).not.toHaveAttribute('href', first!)
  await page.getByLabel('Country', { exact: true }).selectOption('country-fr')
  await expect(page).toHaveURL(/country=country-fr/)
  await expect(page).not.toHaveURL(/page=/)
  await expect(page.getByRole('heading', { name: 'France', exact: true })).toBeVisible()
  await expect(list.locator('li')).toHaveCount(24)
  await page.goBack()
  await expect(page).toHaveURL(/page=2/)
  await expect(page.getByLabel('Country', { exact: true })).toHaveValue('')
})

test('search shows matching contributors and handles an empty result', async ({ page, goto }) => {
  await goto('/people', { waitUntil: 'hydration' })
  const search = page.getByRole('textbox', { name: 'Search contributors' })
  await search.fill('atinux')
  await expect(page.getByRole('list', { name: 'Contributors', exact: true }).getByRole('link')).toHaveCount(1)
  await expect(page.getByRole('link', { name: /atinux/ })).toHaveAttribute('href', '/atinux')
  await search.fill('no-such-nuxter-123456789')
  await expect(page.getByText('No contributors match your search.')).toBeVisible()
  await page.getByRole('button', { name: 'Clear filters' }).click()
  await expect(search).toHaveValue('')
  await expect(page.getByRole('list', { name: 'Contributors', exact: true }).locator('li')).toHaveCount(24)
})

test('globe supports keyboard zoom, country selection and a stable resized view', async ({ page, goto }) => {
  await goto('/people?country=country-fr', { waitUntil: 'hydration' })
  const globe = page.locator('.people-globe')
  await expect(globe).toHaveAttribute('data-ready', 'true')
  await expect(page.getByRole('heading', { name: 'France', exact: true })).toBeVisible()
  const canvas = globe.locator('canvas')
  await canvas.focus()
  await page.keyboard.press('+')
  await expect(globe).toHaveAttribute('data-zoom', '2.05')
  await page.keyboard.press('0')
  await expect(globe).toHaveAttribute('data-zoom', '1')
  await expect(page).not.toHaveURL(/country=/)
  const fixedMarker = globe.locator('[data-country="country-us"]')
  await expect(fixedMarker).toBeVisible()
  const before = await fixedMarker.evaluate(element => element.style.transform)
  await page.setViewportSize({ width: 1100, height: 800 })
  await expect.poll(() => fixedMarker.evaluate(element => element.style.transform)).not.toBe(before)
  await globe.locator('.people-globe__marker[data-visible="true"]').first().click()
  await expect(page).toHaveURL(/country=/)
})

test('mobile contributor panel expands without horizontal overflow', async ({ page, goto }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await goto('/people', { waitUntil: 'hydration' })
  const toggle = page.getByRole('button', { name: 'Expand contributor list' })
  await expect(toggle).toBeVisible()
  const panel = page.locator('.people-panel')
  const initialHeight = await panel.evaluate(element => element.getBoundingClientRect().height)
  await toggle.click()
  await expect(page.getByRole('button', { name: 'Show more of the globe' })).toHaveAttribute('aria-expanded', 'true')
  expect(await panel.evaluate(element => element.getBoundingClientRect().height)).toBeGreaterThan(initialHeight)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('textbox', { name: 'Search contributors' }).fill('atinux')
  await expect(page.getByRole('link', { name: /atinux/ })).toBeVisible()
})

test('directory remains usable when WebGL is unavailable', async ({ page, goto }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: Parameters<typeof original>) {
      if (String(args[0]).startsWith('webgl')) return null
      return original.apply(this, args)
    } as typeof original
  })
  await goto('/people', { waitUntil: 'hydration' })
  await expect(page.getByText('The globe is unavailable on this device.', { exact: false })).toBeVisible()
  await expect(page.getByRole('list', { name: 'Contributors', exact: true }).locator('li')).toHaveCount(24)
})

test('failed directory requests can be retried', async ({ page, goto }) => {
  await goto('/people', { waitUntil: 'hydration' })
  let fail = true
  await page.route('**/api/people/contributors*', (route) => {
    if (fail) return route.fulfill({ status: 503, json: { statusMessage: 'Unavailable' } })
    return route.continue()
  })
  await page.getByRole('textbox', { name: 'Search contributors' }).fill('atinux')
  await expect(page.getByRole('alert')).toContainText('We couldn\'t load the community.')
  fail = false
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.getByRole('link', { name: /atinux/ })).toBeVisible()
})

test('settled globe stops WebGL work and rotation does not resize its drawing buffer', async ({ page, goto }) => {
  await page.addInitScript(() => {
    const counters = { draws: 0, resizes: 0 }
    Object.assign(window, { __globeCounters: counters })
    const draw = WebGLRenderingContext.prototype.drawArrays
    WebGLRenderingContext.prototype.drawArrays = function (...args) {
      counters.draws++
      return draw.apply(this, args)
    }
    for (const key of ['width', 'height']) {
      const descriptor = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, key)!
      Object.defineProperty(HTMLCanvasElement.prototype, key, {
        ...descriptor,
        set(value) {
          counters.resizes++
          descriptor.set!.call(this, value)
        },
      })
    }
  })
  await goto('/people', { waitUntil: 'hydration' })
  const globe = page.locator('.people-globe[data-ready]')
  await expect(globe.locator('canvas')).toBeVisible()
  const counts = () => page.evaluate(() => (window as typeof window & { __globeCounters: { draws: number, resizes: number } }).__globeCounters)
  await expect.poll(async () => (await counts()).draws).toBeGreaterThan(0)
  await page.waitForTimeout(300)
  const settled = await counts()
  await page.waitForTimeout(300)
  expect(await counts()).toEqual(settled)
  await globe.locator('canvas').focus()
  await page.keyboard.press('ArrowRight')
  await expect.poll(async () => (await counts()).draws).toBeGreaterThan(settled.draws)
  expect((await counts()).resizes).toBe(settled.resizes)
})

test('explorer rotates until interaction and supports trackpad pinch and avatar previews', async ({ page, goto }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await goto('/people', { waitUntil: 'hydration' })
  const globe = page.locator('.people-globe')
  await expect(globe).toHaveAttribute('data-ready', 'true')
  const initial = await globe.getAttribute('data-rotation')
  await expect.poll(() => globe.getAttribute('data-rotation')).not.toBe(initial)
  await page.getByLabel('Country', { exact: true }).selectOption('country-fr')
  await expect(globe.locator('.people-globe__avatars img')).toHaveCount(3)
  await expect(page.getByRole('button', { name: 'Resume globe rotation', exact: true })).toBeVisible()
  await globe.dispatchEvent('wheel', { ctrlKey: true, deltaY: -30, deltaMode: 0 })
  await expect.poll(async () => Number(await globe.getAttribute('data-zoom'))).toBeGreaterThan(1.8)
  const pinched = await globe.getAttribute('data-zoom')
  await globe.dispatchEvent('wheel', { ctrlKey: false, deltaY: 100 })
  await expect(globe).toHaveAttribute('data-zoom', pinched!)
  await expect.poll(async () => {
    const before = await globe.getAttribute('data-rotation')
    await page.waitForTimeout(250)
    return await globe.getAttribute('data-rotation') === before
  }, { timeout: 10_000 }).toBe(true)
  const settled = await globe.getAttribute('data-rotation')
  await page.getByRole('button', { name: 'Resume globe rotation', exact: true }).click()
  await expect.poll(() => globe.getAttribute('data-rotation')).not.toBe(settled)
})
