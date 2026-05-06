import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    'nuxt-og-image',
    '@nuxt/image',
    '@nuxt/test-utils/module',
    '@vercel/analytics',
    '@vercel/speed-insights',
  ],

  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
    },
    pageTransition: false,
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    sessionPassword: '',
    github: {
      accessToken: '',
      clientId: '',
      clientSecret: '',
    },
    discord: {
      clientId: '',
      clientSecret: '',
      guildId: '',
      nuxterRoleId: '',
      moduleMaintainerRoleId: '',
      uIProRoleId: '',
      botToken: '',
    },
  },

  experimental: {
    viewTransition: true,
  },

  compatibilityDate: '2025-07-31',

  nitro: {
    storage: {
      cache: {
        driver: 'http',
        base: process.env.CACHE_API_URL,
        headers: {
          Authorization: `Bearer ${process.env.CACHE_API_TOKEN}`,
        },
      },
    },
  },

  vite: {
    optimizeDeps: {
      include: [
        'vue-confetti-explosion',
      ],
    },
  },

  typescript: {
    tsConfig: {
      include: ['../test'],
    },
    nodeTsConfig: {
      include: ['../vitest.config.ts'],
    },
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  image: {
    provider: 'github',
  },

  ogImage: {
    runtimeCacheStorage: {
      driver: 'vercel-runtime-cache',
    },
  },
})
