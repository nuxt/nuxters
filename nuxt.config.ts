import { defineNuxtConfig } from 'nuxt/config'

const cacheDevelopment = {
  driver: 'fs',
  base: '.data/cache',
}
const cacheProduction = {
  driver: 'cloudflare-kv-binding',
  binding: 'KV',
  base: 'cache',
}

export default defineNuxtConfig({
  extends: process.env.NUXT_ELEMENTS_PATH || '@nuxthq/elements',

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
    },
  },

  modules: [
    '@nuxt/devtools',
    '@nuxt/ui',
    '@nuxtjs/google-fonts',
    '@nuxtjs/fontaine',
    '@nuxtjs/plausible',
    '@vueuse/nuxt',
    'nuxt-og-image',
    '@nuxt/image',
  ],

  runtimeConfig: {
    url: '',
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
      memberRoleId: '',
      botToken: '',
    },
  },

  colorMode: {
    preference: 'dark',
  },

  fontMetrics: {
    fonts: ['DM Sans'],
  },

  googleFonts: {
    display: 'swap',
    download: true,
    families: {
      'DM+Sans': [200, 300, 700],
    },
  },

  ui: {
    icons: ['simple-icons', 'ph'],
  },

  nitro: {
    storage: {
      cache: cacheProduction,
    },
    devStorage: {
      cache: cacheDevelopment,
    },
  },
})
