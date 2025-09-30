import { defineConfig, defaultExclude } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  //
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          exclude: [
            ...defaultExclude,
            'test/browser/**',
            'test/nuxt/**',
          ],
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          setupFiles: './test/nuxt/color-mode.js',
          environment: 'nuxt',
          environmentOptions: {
            nuxt: {
              overrides: {
                ogImage: { enabled: false },
              },
            },
          },
          include: ['test/nuxt/**/*.spec.{js,ts}'],
        },
      }),
    ],
  },
})
