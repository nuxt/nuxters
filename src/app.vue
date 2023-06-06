<script setup lang="ts">
useServerSeoMeta({
  description: 'Link your GitHub and Discord accounts to unlock your roles.',
})
</script>

<template>
  <Html class="bg-black text-white font-sans" />
  <div class="relative max-w-5xl w-full mx-auto px-2 md:px-6">
    <Spotlight class="z-[1]" />
    <div class="z-[2] relative flex flex-col min-h-screen items-center py-4 md:justify-center pb-8">
      <article
        class="rounded-lg border-gray-800 border-[1px] px-4 py-4 bg-gradient-to-r from-[rgba(24,24,27,1)] backdrop-blur-sm to-transparent max-w-[40rem] w-full"
      >
        <div>
          <img src="/icon.svg" class="w-5 h-5" height="20" width="20" alt="Nuxt logo" />
        </div>
        <div class="py-2">
          <NuxtPage />
        </div>
      </article>
    </div>
    <a href="https://nuxt.com" class="-mt-8 mb-4 opacity-50 flex justify-center">
      <span class="sr-only">Nuxt</span>
      <img class="h-4" width="132" height="32" alt="Nuxt logo" src="/nuxt.svg" />
    </a>
  </div>
</template>
