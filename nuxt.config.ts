import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Nuxt Stars',
    },
  },
  srcDir: 'src',
  modules: ['@unocss/nuxt'],
  css: ['~/assets/fonts.css', '@unocss/reset/tailwind.css'],
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
})
