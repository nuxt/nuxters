<script setup lang="ts">
useHead({
  link: [
    { rel: 'icon', href: '/icon.png' },
  ],
  htmlAttrs: {
    lang: 'en',
  },
  bodyAttrs: {
    class: 'bg-gray-950',
  },
})

useSeoMeta({
  ogSiteName: 'Nuxters',
  twitterCard: 'summary_large_image',
  twitterSite: '@nuxt_js',
})
</script>

<template>
  <div>
    <AppHeader />
    <UContainer class="overflow-hidden">
      <NuxtPage />
    </UContainer>
    <AppFooter />
  </div>
</template>
