import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    nuxtConfig: {
      runtimeConfig: {
        sessionPassword: 'test-session-password-at-least-32-characters',
      },
    },
    setupTimeout: 600_000,
  },
})
test.setTimeout(60_000)

// TODO: figure out how to run these with `@nuxthub/core` module enabled

test('home page', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveScreenshot()
})

test('landing page contains the community globe', async ({ page }) => {
  await page.goto('/')

  const section = page.locator('.home-people')
  const globe = section.locator('.people-globe')
  const canvas = globe.locator('canvas')
  await expect(globe).toHaveAttribute('data-ready', 'true')
  await expect(canvas).toBeVisible()
  expect(await globe.locator('.people-globe__viewport').evaluate(element => getComputedStyle(element).maskImage)).toContain('radial-gradient')
  await expect(section.getByRole('group', { name: 'Globe version' })).toHaveCount(0)
  expect(await globe.locator('.people-globe__avatar-marker').count()).toBeGreaterThan(150)
  const hiddenAvatar = globe.locator('.people-globe__avatar-marker:not(.is-visible)').first()
  await expect(hiddenAvatar).toBeAttached()
  const hiddenAvatarStyle = await hiddenAvatar.evaluate((element) => {
    const style = getComputedStyle(element)
    return { duration: style.transitionDuration, transform: style.transform }
  })
  expect(hiddenAvatarStyle.duration).toContain('0.36s')
  expect(hiddenAvatarStyle.transform).toContain('0.76')
  await expect(section.getByRole('button', { name: /Explore globe/ })).toHaveCount(0)
  await expect(section.locator('.home-people__browser')).toHaveCount(0)
  const controls = globe.getByRole('group', { name: 'Globe controls' })
  await expect(controls).toHaveCSS('opacity', '0')
  await expect(controls.getByRole('button', { name: 'Zoom out' })).toBeAttached()
  await expect(controls.getByRole('button', { name: 'Zoom in' })).toBeAttached()
  await expect(controls.getByRole('button', { name: 'Collapse map' })).toHaveCount(0)
  await expect(controls.getByRole('button', { name: 'Reset world view' })).toHaveCount(0)
  await expect(globe).toHaveAttribute('data-avatar-detail', '0')
  expect(Number(await globe.getAttribute('data-avatar-count'))).toBeGreaterThan(150)
  await expect(globe.locator('[style*="anchor-name"]')).toHaveCount(0)
  await expect.poll(() => globe.locator('.people-globe__avatar-marker.is-visible').count()).toBeGreaterThan(20)
  expect(await globe.locator('.people-globe__avatar-marker.is-visible').first().evaluate(element => getComputedStyle(element).transitionDuration)).toContain('0.52s')
  const globeCenter = await globe.evaluate(element => element.getBoundingClientRect().x + element.getBoundingClientRect().width / 2)
  const statsCenter = await section.locator('.home-people__stats').evaluate(element => element.getBoundingClientRect().x + element.getBoundingClientRect().width / 2)
  expect(Math.abs(globeCenter - statsCenter)).toBeLessThan(2)

  await page.getByRole('heading', { name: 'Are you a Nuxter?' }).hover()
  await page.waitForTimeout(200)
  await globe.hover()
  await expect(globe).toHaveAttribute('data-paused', 'true')
  await expect(controls).toHaveCSS('opacity', '1')
  const pausedRotation = Number(await globe.getAttribute('data-rotation'))
  await page.waitForTimeout(300)
  expect(Math.abs(Number(await globe.getAttribute('data-rotation')) - pausedRotation)).toBeLessThan(0.005)
  const zoomBeforeButton = Number(await globe.getAttribute('data-zoom'))
  await controls.getByRole('button', { name: 'Zoom in' }).click()
  await expect.poll(async () => Number(await globe.getAttribute('data-zoom'))).toBeGreaterThan(zoomBeforeButton)
  for (let step = 0; step < 12 && await controls.getByRole('button', { name: 'Zoom in' }).isEnabled(); step++)
    await controls.getByRole('button', { name: 'Zoom in' }).click()
  await expect(globe).toHaveAttribute('data-zoom', '100')
  const zoomedGlobeBounds = await globe.evaluate((element) => {
    const bounds = element.getBoundingClientRect()
    return { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }
  })
  await expect.poll(async () => globe.locator('.people-globe__avatar-marker.is-visible').evaluateAll((elements, globeBounds) => elements.filter((element) => {
    const bounds = element.getBoundingClientRect()
    const centerX = bounds.x + bounds.width / 2
    const centerY = bounds.y + bounds.height / 2
    const radius = Math.hypot(centerX - globeBounds.x - globeBounds.width / 2, centerY - globeBounds.y - globeBounds.height / 2)
    return radius > globeBounds.width * 0.44 + 1
  }).length, zoomedGlobeBounds)).toBe(0)
  await page.getByRole('heading', { name: 'Are you a Nuxter?' }).hover()
  await expect(globe).not.toHaveAttribute('data-paused')
  await expect.poll(async () => Math.abs(Number(await globe.getAttribute('data-rotation')) - pausedRotation)).toBeGreaterThan(0.005)

  const avatarPositions = await globe.locator('.people-globe__avatar-marker').evaluateAll(elements => new Set(elements.map((element) => {
    const bounds = element.getBoundingClientRect()
    return `${Math.round(bounds.x)},${Math.round(bounds.y)}`
  })).size)
  expect(avatarPositions).toBeGreaterThan(20)
  await globe.locator('.people-globe__avatar-marker.is-visible').first().dispatchEvent('click')
  const profilePanel = page.getByRole('dialog')
  await expect(profilePanel).toContainText('Merged PRs')
  await expect(profilePanel.getByRole('link', { name: 'View full Nuxter profile' })).toBeVisible()
  await profilePanel.getByRole('button', { name: 'Close' }).click()

  const zoomBeforeWheel = await globe.getAttribute('data-zoom')
  await canvas.dispatchEvent('wheel', { deltaY: -500 })
  await expect(globe).toHaveAttribute('data-zoom', zoomBeforeWheel ?? '0')
  await canvas.dispatchEvent('pointerdown', { pointerId: 1, clientX: 100, clientY: 100 })
  await canvas.dispatchEvent('pointermove', { pointerId: 1, clientX: 100, clientY: 420 })
  await canvas.dispatchEvent('pointerup', { pointerId: 1, clientX: 100, clientY: 420 })
  await expect.poll(async () => Number(await globe.getAttribute('data-latitude'))).toBeGreaterThan(70)
  await expect.poll(async () => Number(await globe.getAttribute('data-rendered-latitude'))).toBeGreaterThan(70)

  await expect(page.getByRole('heading', { name: 'Become a Nuxter' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Check my GitHub contributions' })).toBeVisible()
  await expect(page.getByText('We never store your GitHub token.')).toBeVisible()
  await page.getByRole('button', { name: 'How we use your GitHub data' }).click()
  await expect(page.getByText('We keep only the account details needed to match contributions and grant Discord roles in a secure session cookie.')).toBeVisible()
  await expect(page.getByLabel('Layout')).toHaveCount(0)
  await expect(page.getByText('Join section prototype')).toHaveCount(0)
  await expect(section).toContainText('26,287')
  await expect(section).toContainText('164')
  await expect(section).not.toContainText('Regional zoom limit')
  await expect(section).not.toContainText('Approximate locations')
  await expect(section).not.toContainText('Explore the community')
  await expect(section).not.toContainText('Find Nuxters near you')
  await expect(section.locator('a[href="/people"]')).toHaveCount(0)
})

test('mobile keeps the globe without a country browser', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const section = page.locator('.home-people')
  const globe = section.locator('.people-globe')
  const canvas = globe.locator('canvas')
  await expect(globe).toHaveAttribute('data-ready', 'true')
  await expect(globe).toHaveCSS('position', 'relative')
  await expect(canvas).toHaveCSS('touch-action', 'pan-y')
  await expect(section.locator('.home-people__browser')).toHaveCount(0)
  await expect(section.getByRole('button', { name: /Explore globe/ })).toHaveCount(0)
  const globeCenter = await globe.evaluate(element => element.getBoundingClientRect().x + element.getBoundingClientRect().width / 2)
  const statsCenter = await section.locator('.home-people__stats').evaluate(element => element.getBoundingClientRect().x + element.getBoundingClientRect().width / 2)
  expect(Math.abs(globeCenter - statsCenter)).toBeLessThan(2)

  const zoomBeforePinch = Number(await globe.getAttribute('data-zoom'))
  await canvas.dispatchEvent('pointerdown', { pointerId: 1, pointerType: 'touch', clientX: 100, clientY: 100 })
  await canvas.dispatchEvent('pointerdown', { pointerId: 2, pointerType: 'touch', clientX: 200, clientY: 100 })
  await canvas.dispatchEvent('pointermove', { pointerId: 2, pointerType: 'touch', clientX: 250, clientY: 100 })
  await canvas.dispatchEvent('pointerup', { pointerId: 2, pointerType: 'touch', clientX: 250, clientY: 100 })
  await canvas.dispatchEvent('pointerup', { pointerId: 1, pointerType: 'touch', clientX: 100, clientY: 100 })
  await expect.poll(async () => Number(await globe.getAttribute('data-zoom'))).toBeGreaterThan(zoomBeforePinch)
})

test('globe animation pauses outside the viewport', async ({ page }) => {
  await page.goto('/')

  const globe = page.locator('.people-globe[data-ready]')
  await globe.scrollIntoViewIfNeeded()
  const initialRotation = Number(await globe.getAttribute('data-rotation'))
  await expect.poll(async () => Math.abs(Number(await globe.getAttribute('data-rotation')) - initialRotation)).toBeGreaterThan(0.005)

  await page.evaluate(() => scrollTo(0, document.body.scrollHeight))
  await expect.poll(() => globe.evaluate((element) => {
    const bounds = element.getBoundingClientRect()
    return bounds.bottom <= 0 || bounds.top >= innerHeight
  })).toBe(true)
  await page.waitForTimeout(100)
  const pausedRotation = Number(await globe.getAttribute('data-rotation'))
  await page.waitForTimeout(300)
  expect(Math.abs(Number(await globe.getAttribute('data-rotation')) - pausedRotation)).toBeLessThan(0.005)

  await globe.scrollIntoViewIfNeeded()
  await expect.poll(async () => Math.abs(Number(await globe.getAttribute('data-rotation')) - pausedRotation)).toBeGreaterThan(0.005)
})

test('og image for home page', async ({ page }) => {
  await page.goto('/__og-image__/image/og.png')
  await expect(page).toHaveScreenshot()
})
