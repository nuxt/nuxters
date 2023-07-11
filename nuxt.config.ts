import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
    },
  },

  modules: ['@nuxt/devtools', '@nuxthq/ui', '@nuxtjs/google-fonts', '@nuxtjs/fontaine'],

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
    preference: 'dark',
  },

  fontMetrics: {
    fonts: ['DM Sans'],
  },

  googleFonts: {
    display: 'swap',
    download: true,
    families: {
      'DM+Sans': [400, 500, 700],
    },
  },

  ui: {
    icons: ['simple-icons', 'ph'],
  },

  nitro: {
    storage: {
      cache: {
        driver: 'cloudflare-kv-binding',
        binding: 'KV',
        base: 'cache',
      },
    },
    devStorage: {
      cache: {
        driver: 'fs',
        base: '.data/cache',
      },
    },
  },

  plugins: ['~/plugins/dark.client.ts'],
})
