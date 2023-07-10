<script setup lang="ts">

useHead({
  link: [
    { rel: 'icon', href: '/icon.png' }
  ],
  meta: [
    { property: 'og:site_name', content: 'Nuxters' },
    { property: 'og:type', content: 'website' },
    //TODO
    //{ property: 'og:image', content: '' },
    { property: 'og:image:alt', content: 'Nuxters' },
    { property: 'description', content: 'description' },
    { property: 'twitter:card', content: 'summary_large_image' },
    { property: 'twitter:site', content: '@nuxt_js' },
  ],
  htmlAttrs: {
    lang: 'en'
  },
  bodyAttrs: {
    class: 'bg-gray-950 font-light'
  }
})

useServerSeoMeta({
  description: 'Link your GitHub and Discord accounts to unlock your roles.',
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
