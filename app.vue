<script setup lang="ts">
useHead({
  link: [
    { rel: 'icon', href: '/icon.png' }
  ],
  htmlAttrs: {
    lang: 'en'
  },
  bodyAttrs: {
    class: 'bg-gray-950 font-light'
  }
})

useSeoMeta({
  title: 'Are you a Nuxter?',
  description: 'Discover your contributions to unlock a role on the Nuxt Discord server.',
  ogSiteName: 'Nuxters',
  ogImage: '/social-card.jpg',
  ogImageAlt: 'Nuxters',
  twitterImage: '/social-card.jpg',
  twitterCard: 'summary_large_image',
  twitterSite: '@nuxt_js',
})
</script>

<template>
  <div>
    <AppHeader />
    <UContainer>
      <NuxtPage />
    </UContainer>
    <AppFooter />
  </div>
</template>
