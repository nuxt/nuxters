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
  devtools: { enabled: true },
  experimental: { appManifest: false },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
    },
  },

  modules: [
    '@nuxt/ui',
    '@nuxtjs/google-fonts',
    '@nuxtjs/fontaine',
    '@nuxtjs/plausible',
    '@vueuse/nuxt',
    'nuxt-og-image'
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
