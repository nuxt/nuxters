<script setup>
definePageMeta({
  colorMode: 'dark',
})

useHead({
  link: [{ rel: 'canonical', href: 'https://nuxters.nuxt.com' }],
})

useSeoMeta({
  title: 'Are you a Nuxter?',
  ogTitle: 'Are you a Nuxter?',
  description: 'Find your Nuxt contributions, unlock Discord roles, and share your Nuxter profile.',
  ogDescription: 'Find your Nuxt contributions, unlock Discord roles, and share your Nuxter profile.',
  ogImage: 'https://nuxters.nuxt.com/social-card.jpg',
  ogImageAlt: 'Nuxters',
  twitterImage: 'https://nuxters.nuxt.com/social-card.jpg',
  ogUrl: 'https://nuxters.nuxt.com',
})
</script>

<template>
  <div class="text-green-400 flex flex-col gap-y-[72px] py-10 lg:py-20">
    <HomePeople />
    <HomeJoin />
    <HomeContributors />
  </div>
</template>
