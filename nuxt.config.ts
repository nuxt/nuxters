import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Are you a Nuxter?',
    },
  },
  modules: ['@nuxt/devtools', 'nuxt-og-image', '@nuxthq/ui', '@nuxtjs/google-fonts'],
  ogImage: {
    site: process.env.NUXT_SITE || '',
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
    icons: ['heroicons', 'bx']
  },
})
