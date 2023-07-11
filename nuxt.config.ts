import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: { lang: 'en' }
    },
  },
  modules: [
    '@nuxt/devtools',
    '@nuxthq/ui',
    '@nuxtjs/google-fonts'
  ],
  // ogImage: {
  //   site: process.env.NUXT_URL || '',
  // },
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
    preference: 'dark'
  },
  googleFonts: {
    display: 'swap',
    families: {
      'DM+Sans': {
        wght: [300 ,400, 500, 700],
        ital: [300]
      },
    },
  },
  ui: {
    icons: ['simple-icons', 'ph']
  },
  nitro: {
    storage: {
      cache: {
        driver: 'cloudflare-kv-binding',
        binding: 'NUXTERS_CACHE'
      }
    },
    devStorage: {
      cache: {
        driver: 'fs',
        base: '.data/cache'
      }
    }
  },
})
