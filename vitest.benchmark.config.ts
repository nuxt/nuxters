import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    benchmark: {
      include: ['test/benchmarks/**/*.bench.ts'],
    },
  },
})
