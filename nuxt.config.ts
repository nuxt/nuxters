import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  srcDir: 'src',
  modules: ['@unocss/nuxt'],
  css: ['~/assets/fonts.css', '@unocss/reset/tailwind.css'],
  experimental: {
    noScripts: true,
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
})
