import type { CDPSession, Page } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { arch, cpus, platform } from 'node:os'
import { resolve } from 'node:path'
import { expect, test } from '@nuxt/test-utils/playwright'

interface Profile {
  cpuRate: number
  deviceScaleFactor: number
  hasTouch: boolean
  height: number
  isMobile: boolean
  name: 'desktop' | 'slow-phone-6x'
  width: number
}

interface RuntimeSnapshot {
  dom: {
    documents: number
    jsEventListeners: number
    nodes: number
  }
  heap: {
    embedderHeapUsedSize: number
    totalSize: number
    usedSize: number
  }
  performance: Record<string, number>
}

const profiles: Profile[] = [
  {
    cpuRate: 1,
    deviceScaleFactor: 1,
    hasTouch: false,
    height: 900,
    isMobile: false,
    name: 'desktop',
    width: 1440,
  },
  {
    cpuRate: 6,
    deviceScaleFactor: 2,
    hasTouch: true,
    height: 844,
    isMobile: true,
    name: 'slow-phone-6x',
    width: 390,
  },
]
const runs = Number(process.env.PERF_RUNS ?? 3)

test.use({
  nuxt: {
    build: true,
    dev: false,
    nuxtConfig: {
      devtools: { enabled: false },
      runtimeConfig: {
        sessionPassword: 'test-session-password-at-least-32-characters',
      },
    },
    setupTimeout: 600_000,
  },
})
test.setTimeout(180_000)

async function runtimeSnapshot(cdp: CDPSession): Promise<RuntimeSnapshot> {
  await cdp.send('HeapProfiler.collectGarbage')
  const [performanceMetrics, dom, heap] = await Promise.all([
    cdp.send('Performance.getMetrics') as Promise<{ metrics: Array<{ name: string, value: number }> }>,
    cdp.send('Memory.getDOMCounters') as Promise<RuntimeSnapshot['dom']>,
    cdp.send('Runtime.getHeapUsage') as Promise<RuntimeSnapshot['heap']>,
  ])

  return {
    dom,
    heap,
    performance: Object.fromEntries(performanceMetrics.metrics.map(metric => [metric.name, metric.value])),
  }
}

async function installObservers(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const metrics = {
      cls: 0,
      lcp: 0,
      longTasks: [] as Array<{ duration: number, startTime: number }>,
    }
    const target = window as typeof window & { __nuxtersPerformance?: typeof metrics }
    target.__nuxtersPerformance = metrics

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries())
        metrics.longTasks.push({ duration: entry.duration, startTime: entry.startTime })
    }).observe({ type: 'longtask', buffered: true })

    new PerformanceObserver((list) => {
      const entry = list.getEntries().at(-1)
      if (entry)
        metrics.lcp = entry.startTime
    }).observe({ type: 'largest-contentful-paint', buffered: true })

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput: boolean, value: number }
        if (!shift.hadRecentInput)
          metrics.cls += shift.value
      }
    }).observe({ type: 'layout-shift', buffered: true })
  })
}

async function measureFrames(page: Page, durationMs: number) {
  return page.evaluate(async (duration) => {
    const gaps: number[] = []
    const start = performance.now()
    let previous = start

    await new Promise<void>((resolve) => {
      function frame(now: number): void {
        const gap = now - previous
        if (gap > 0)
          gaps.push(gap)
        previous = now
        if (now - start >= duration)
          resolve()
        else
          requestAnimationFrame(frame)
      }
      requestAnimationFrame(frame)
    })

    return { durationMs: previous - start, gapsMs: gaps }
  }, durationMs)
}

function percentile(values: number[], percentile: number): number {
  const sorted = values.toSorted((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * percentile) - 1)] ?? 0
}

test('records production homepage performance', async ({ baseURL, browser, browserName }) => {
  expect(browserName).toBe('chromium')
  const results = []

  for (const profile of profiles) {
    for (let run = 1; run <= runs; run++) {
      const context = await browser.newContext({
        deviceScaleFactor: profile.deviceScaleFactor,
        hasTouch: profile.hasTouch,
        isMobile: profile.isMobile,
        reducedMotion: 'no-preference',
        viewport: { height: profile.height, width: profile.width },
      })
      const page = await context.newPage()
      const cdp = await context.newCDPSession(page)
      await cdp.send('Network.enable')
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
      await cdp.send('Performance.enable', { timeDomain: 'timeTicks' })
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile.cpuRate })
      await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: profile.hasTouch })
      await installObservers(page)

      const response = await page.goto(baseURL!, { waitUntil: 'load' })
      expect(response?.status()).toBe(200)

      const beforeAnimation = await runtimeSnapshot(cdp)
      const frames = await measureFrames(page, 5_000)
      const afterAnimation = await runtimeSnapshot(cdp)
      const browserMetrics = await page.evaluate(() => {
        const target = window as typeof window & {
          __nuxtersPerformance?: {
            cls: number
            lcp: number
            longTasks: Array<{ duration: number, startTime: number }>
          }
        }
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]

        return {
          observer: target.__nuxtersPerformance,
          load: {
            decodedBodySize: navigation.decodedBodySize + resources.reduce((sum, entry) => sum + entry.decodedBodySize, 0),
            domContentLoadedMs: navigation.domContentLoadedEventEnd,
            encodedBodySize: navigation.encodedBodySize + resources.reduce((sum, entry) => sum + entry.encodedBodySize, 0),
            firstContentfulPaintMs: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0,
            loadEventMs: navigation.loadEventEnd,
            resourceCount: resources.length,
            responseEndMs: navigation.responseEnd,
            transferSize: navigation.transferSize + resources.reduce((sum, entry) => sum + entry.transferSize, 0),
          },
        }
      })

      results.push({
        afterAnimation,
        beforeAnimation,
        browserMetrics,
        frameSummary: {
          count: frames.gapsMs.length,
          over50ms: frames.gapsMs.filter(gap => gap > 50).length,
          p50Ms: percentile(frames.gapsMs, 0.5),
          p95Ms: percentile(frames.gapsMs, 0.95),
          p99Ms: percentile(frames.gapsMs, 0.99),
        },
        frames,
        profile,
        run,
      })

      await context.close()
    }
  }

  const output = resolve(process.cwd(), process.env.PERF_OUTPUT_DIR ?? 'performance-results', 'homepage.json')
  await mkdir(resolve(output, '..'), { recursive: true })
  await writeFile(output, `${JSON.stringify({
    browser: await browser.version(),
    commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    generatedAt: new Date().toISOString(),
    machine: { arch: arch(), cpu: cpus()[0]?.model, node: process.version, platform: platform() },
    results,
    runs,
  }, null, 2)}\n`)
})
