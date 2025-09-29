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
    '@nuxthub/core',
  ],
  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
    },
  },

  colorMode: {
    preference: 'dark',
  },

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
      nuxterRoleId: '',
      moduleMaintainerRoleId: '',
      uIProRoleId: '',
      botToken: '',
    },
  },

  routeRules: {
    '/card/**': { proxy: '/__og-image__/image/**' },
  },

  compatibilityDate: '2025-07-31',

  hub: {
    cache: true,
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  image: {
    ipx: {
      baseURL: 'https://ipx.nuxt.com',
    },
  },
})
