<script setup lang="ts">
useHead({
  link: [
    { rel: 'icon', href: '/icon.png' }
  ],
  htmlAttrs: {
    lang: 'en'
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
    <UHeader>
      <template #logo>
        <NuxtDropdown />
      </template>
      <template #right>
        <UButton to="https://discord.com/invite/nuxt" class="mr-2" target="_blank" variant="ghost" color="gray"
          aria-label="Join us" icon="i-simple-icons-discord" />
        <UButton to="http://www.github.com/nuxt/nuxt" variant="ghost" color="gray" target="_blank" aria-label="Star us"
          icon="i-simple-icons-github" />
      </template>
    </UHeader>

    <UContainer>
      <NuxtPage />
    </UContainer>

    <UFooter>
      <template #left>
        <p class="text-gray-300 text-sm text-center">
          Made with love by the Nuxt Community 💚 (<NuxtLink to="https://github.com/nuxt/nuxt.new" target="_blank"
            class="underline hover:text-white" aria-label="View nuxt.new source code on github">source code</NuxtLink>).
        </p>
      </template>
      <template #right>
        <UButton to="https://discord.com/invite/nuxt" target="_blank" variant="ghost" color="gray" aria-label="Join us"
          icon="i-simple-icons-discord" />
        <UButton to="http://www.github.com/nuxt/nuxt" variant="ghost" color="gray" target="_blank" aria-label="Star us"
          icon="i-simple-icons-github" />
        <UButton aria-label="Nuxt on X" icon="i-simple-icons-twitter" to="https://x.com/nuxt_js" variant="ghost"
          color="gray" />
      </template>
    </UFooter>
  </div>
</template>
