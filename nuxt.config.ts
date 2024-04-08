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
    "@nuxt/image"
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
      nuxterRoleId: '',
      moduleMaintainerRoleId: '',
      botToken: '',
    },
  },

  colorMode: {
    preference: 'dark',
  },

  ui: {
    icons: ['simple-icons', 'ph'],
  },

  image: {
    ipx: {
      baseURL: 'https://ipx.nuxt.com'
    }
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
