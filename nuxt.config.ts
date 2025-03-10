import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
    },
  },

  modules: [
    '@nuxt/fonts',
    '@nuxt/ui',
    '@nuxtjs/plausible',
    '@vueuse/nuxt',
    'nuxt-og-image',
    "@nuxt/image",
    "@nuxthub/core"
  ],

  hub: {
    cache: true
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
      botToken: '',
    },
  },

  colorMode: {
    preference: 'dark',
  },

  image: {
    ipx: {
      baseURL: 'https://ipx.nuxt.com'
    }
  },

  routeRules: {
    '/card/**': { proxy: '/__og-image__/image/**' },
  },

  compatibilityDate: '2025-03-10'
})