<script setup lang="ts">
useHead({
  link: [
    { rel: 'icon', href: '/icon.png' },
  ],
  htmlAttrs: {
    lang: 'en',
  },
  bodyAttrs: {
    class: 'bg-neutral-950',
  },
})

useSeoMeta({
  ogSiteName: 'Nuxters',
  twitterCard: 'summary_large_image',
  twitterSite: '@nuxt_js',
})
</script>

<template>
  <UApp>
    <AppHeader />
    <UContainer class="overflow-hidden">
      <NuxtPage />
    </UContainer>
    <AppFooter />
  </UApp>
</template>
