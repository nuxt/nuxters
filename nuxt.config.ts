import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/ui',
    '@nuxtjs/plausible',
    '@vueuse/nuxt',
    'nuxt-og-image',
    '@nuxt/image',
    '@nuxt/test-utils/module',
    '@nuxthub/core',
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

  routeRules: {
    '/card/**': { proxy: '/__og-image__/image/**' },
  },

  experimental: {
    viewTransition: true,
  },

  compatibilityDate: '2025-07-31',

  hub: {
    cache: true,
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
    compatibility: {
      runtime: {
        chromium: false,
      },
    },
  },
})
