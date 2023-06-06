import { defineNuxtConfig } from 'nuxt/config'
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Nuxt Stars',
    },
  },
  srcDir: 'src',
  modules: ['@unocss/nuxt', 'nuxt-og-image'],
  css: ['~/assets/fonts.css', '@unocss/reset/tailwind.css'],
  experimental: {
    noScripts: true,
  },
  ogImage: {
    site: process.env.NUXT_SITE || '',
    fonts: [
      {
        name: 'RoobertPRO',
        weight: 300,
        path: 'fonts/RoobertPRO-Light.woff',
      },
      {
        name: 'RoobertPRO',
        weight: 400,
        path: 'fonts/RoobertPRO-Regular.woff',
      },
      {
        name: 'RoobertPRO',
        weight: 700,
        path: 'fonts/RoobertPRO-Bold.woff',
      },
    ],
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
