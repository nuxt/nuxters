<script setup>

useHead({
  link: [{ rel: 'canonical', href: 'https://nuxters.nuxt.com' }],
})

useSeoMeta({
  title: 'Are you a Nuxter?',
  ogTitle: 'Are you a Nuxter?',
  description: 'Discover your contributions to unlock the nuxter role on Nuxt Discord server.',
  ogDescription: 'Discover your contributions to unlock the nuxter role on Nuxt Discord server.',
  ogImage: 'https://nuxters.nuxt.com/social-card.jpg',
  ogImageAlt: 'Nuxters',
  twitterImage: 'https://nuxters.nuxt.com/social-card.jpg',
  ogUrl: 'https://nuxters.nuxt.com'
})
</script>

<template>
  <div class="text-green-400 flex flex-col gap-y-[72px] py-10 lg:py-40">
    <HomeHero />
    <HomeContributors />
    <HomeJoin />
  </div>
</template>
