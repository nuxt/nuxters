<script setup lang="ts">
const unlockList = ['1 pull request merged', '1 helpful issue (3+ reactions)', '1 helpful comment (3+ reactions)']
</script>

<template>
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
            <span>
                                                                                                {{ item }}
                                                                                              </span>
          </li>
        </ul>
        <div class="w-20 h-[1px] bg-gray-700 mt-8 mb-4" />
        <span class="italic text-gray-400 text-base">
                                                                                            Note that your details are stored in a secured cookie and only used to grant you roles on Discord.
                                                                                          </span>
      </div>
    </template>
    <HomeCard />
  </ULandingHero>
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
