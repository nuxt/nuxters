<script setup lang="ts">
const socialLinks = [
  {
    to: 'https://twitter.com/nuxt_js',
    alt: 'Nuxt Twitter Account',
    icon: 'i-simple-icons-twitter'
  },
  {
    to: 'https://github.com/nuxt/nuxt',
    alt: 'Nuxt GitHub Repository',
    icon: 'i-simple-icons-github'
  },
  {
    to: 'https://discord.com/invite/nuxt',
    alt: 'Nuxt Discord Channel',
    icon: 'i-simple-icons-discord'
  }
] as Array<{ to: string, alt: string, icon: string }>
</script>

<template>
  <div class="border-t border-gray-800 py-8">
    <UContainer class="flex justify-between items-center gap-x-4">
      <span class="text-gray-200 text-sm">
        Made with love by Nuxt Community 💚
      </span>
      <ul class="flex items-center justify-center gap-x-2">
        <li v-for="social in socialLinks" :key="social.to" >
          <UButton variant="link" color="gray" :to="social.to" :alt="social.alt" :icon="social.icon" target="_blank" />
        </li>
      </ul>
    </UContainer>
  </div>
</template>
