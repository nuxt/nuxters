<script setup lang="ts">
const links = [
  {
    title: 'Nuxt.com',
    description: 'Framework documentation',
    to: 'https://nuxt.com',
  },
  {
    title: 'Nuxt.new',
    description: 'Nuxt templates',
    to: '/',
  },
] as Array<{ title: string; description: string; to: string }>
</script>

<template>
  <div class="h-20 w-full sticky top-0 bg-gray-950/70 backdrop-blur-md z-50 flex flex-col justify-center">
    <UContainer class="flex justify-between items-center w-full">
      <div class="flex gap-x-2 items-center">
        <NuxtLink to="/">
          <Logo class="h-6" />
        </NuxtLink>

        <UPopover :ui="{ ring: 'border-2 border-gray-900', shadow: 'none', rounded: 'rounded-lg' }">
          <UButton variant="link" class="flex flex-row gap-x-4 items-center">
            <img class="text-gray-300 w-4 h-4 mt-2" src="/dropdown-chevron.svg" />
          </UButton>

          <template #panel>
            <ul class="flex flex-col gap-y-1 p-2 bg-gray-950">
              <li v-for="link in links" :key="link.title" class="p-2 rounded-lg hover:bg-white/5">
                <NuxtLink :to="link.to" class="flex gap-x-4 items-center" target="_blank">
                  <img class="text-white w-6 h-6 self-center" src="/nuxt.svg" />
                  <div class="flex flex-col gap-y-1 text-white">
                    <span class="font-bold text-sm">{{ link.title }}</span>
                    <span class="text-xs text-gray-400">{{ link.description }}</span>
                  </div>
                </NuxtLink>
              </li>
            </ul>
          </template>
        </UPopover>
      </div>
      <div class="flex mt-2 items-center sm:gap-x-4 text-white font-medium">
        <UButton
          class="flex items-center sm:-mr-2"
          to="https://discord.com/invite/nuxt"
          target="_blank"
          variant="link"
          color="gray"
          size="xl"
        >
          <UIcon name="i-bx-bxl-discord-alt" class="h-5 w-5" />
          <span class="hidden sm:block">Join us</span>
        </UButton>
        <div class="hidden sm:block h-8 w-[1px] bg-gray-700 -mr-2 sm:-mr-6" />
        <UButton class="flex gap-x-2 items-center" variant="link" color="gray" size="xl" to="/">
          <UIcon name="i-bx-bxl-github" class="h-5 w-5 sm:ml-4" />
          <span class="hidden sm:block">Star us</span>
        </UButton>
      </div>
    </UContainer>
  </div>
</template>
