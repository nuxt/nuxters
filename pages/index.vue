<script setup>
useSeoMeta({
  title: 'Are you a Nuxter?',
  ogTitle: 'Are you a Nuxter?',
  description: 'Discover your contributions to unlock the nuxter role on Nuxt Discord server.',
  ogDescription: 'Discover your contributions to unlock the nuxter role on Nuxt Discord server.',
  ogImage: 'https://nuxters.nuxt.com/social-card.jpg',
  ogImageAlt: 'Nuxters',
  twitterImage: 'https://nuxters.nuxt.com/social-card.jpg'
})

const unlockList = ['1 pull request merged', '1 helpful issue (3+ reactions)', '1 helpful comment (3+ reactions)']
</script>

<template>
  <div class="text-green-400 flex flex-col gap-y-[72px] py-10 lg:py-40">
    <ULandingHero orientation="horizontal" align="left" :ui="{
      wrapper: 'py-8 sm:py-10 md:py-12 relative', base: 'flex justify-center flex-col items-center md:items-start',
      container: 'flex flex-col md:flex-row md:text-left gap-12 items-center', title: 'text-4xl lg:text-6xl font-bold mb-4',
      description: 'mt-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed'
    }">
      <template #title>
        Are you a <span class="text-green-400">Nuxter</span>?
      </template>
      <template #description>
        Discover your contributions on
        <NuxtLink to="https://github.com/nuxt/nuxt" target="_blank" class="font-semibold underline">nuxt</NuxtLink>
        and
        <NuxtLink to="https://github.com/nuxt/modules" target="_blank" class="font-semibold underline">nuxt modules
        </NuxtLink> organisations and unlock
        the <UBadge size="md" color="primary" variant="solid">nuxter</UBadge> role on <NuxtLink
          to="https://discord.com/invite/nuxt" target="_blank" class="font-semibold underline">Nuxt Discord server
        </NuxtLink>.
        <div>
          <div class="my-2">Unlock it by having either:</div>
          <ul class="flex flex-col gap-y-1 pt-1 text-base">
            <li v-for="item in unlockList" :key="item" class="flex gap-x-2">
              <UIcon name="i-heroicons-check-circle-20-solid" class="h-5 w-5 text-green-400" />
              <div>
                {{ item }}
              </div>
            </li>
          </ul>
          <div class="w-20 h-[1px] bg-gray-700 mt-8 mb-4" />
          <div class="italic text-gray-400 text-base">
            Note that your details are stored in a secured cookie and only used to grant you roles on Discord.
          </div>
        </div>
      </template>

      <!-- Nuxters card -->
      <HomeCard />
    </ULandingHero>

    <!-- CTA -->
    <ULandingCTA
      :ui="{ wrapper: 'relative bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-slate-800 rounded-lg', links: 'mt-10 flex flex-col sm:flex-row items-center gap-6' }"
      description="Become a Nuxter and help shape the future of Nuxt. Contribute, collaborate and join our community today!">
      <template #title>
        Ready to <span class="text-green-400">Join us</span>?
      </template>
      <template #links>
        <UButton to="https://github.com/nuxt/nuxt" icon="i-simple-icons-github" label="Nuxt"
          :ui="{ rounded: 'rounded-full' }" class="px-7 z-10" variant="outline" color="gray" target="_blank"
          aria-label="nuxt" />
        <UButton to="https://nuxt.com/modules" icon="i-simple-icons-github" label="Nuxt Modules"
          :ui="{ rounded: 'rounded-full' }" class="px-7 z-10" variant="outline" color="gray" target="_blank"
          aria-label="nuxt module" />
      </template>
      <div
        class="absolute inset-0 w-full h-full bg-[url('/join-gradient-bg-sm.svg')] lg:bg-[url('/join-gradient-bg.svg')] bg-no-repeat bg-bottom" />
    </ULandingCTA>
  </div>
</template>


<style scoped lang="postcss">
p a {
  border-bottom: 1px;
}

p a:hover {
  border-bottom-color: var(--color-primary-400);
  color: var(--color-primary-400);
}
</style>
