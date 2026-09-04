<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const links: DropdownMenuItem[] = [
  {
    label: 'Nuxt.com',
    description: 'Framework documentation',
    to: 'https://nuxt.com/?utm_source=nuxters&utm_medium=dropdown&utm_campaign=home',
    icon: 'i-simple-icons-nuxtdotjs',
  },
  {
    label: 'Nuxt.new',
    description: 'Nuxt templates',
    to: 'https://nuxt.new/?utm_source=nuxters&utm_medium=dropdown&utm_campaign=home',
    icon: 'i-simple-icons-nuxtdotjs',
  },
]
</script>

<template>
  <div class="h-20 w-full sticky top-0 bg-neutral-950/70 backdrop-blur-md z-50 flex flex-col justify-center">
    <UContainer class="flex justify-between items-center w-full">
      <div class="flex items-center">
        <NuxtLink
          to="/"
          aria-label="Nuxters home"
          class="flex items-center"
        >
          <TheLogo class="h-6" />
        </NuxtLink>
        <UDropdownMenu
          :items="links"
          size="xl"
        >
          <UButton
            variant="ghost"
            color="neutral"
            icon="i-ph-caret-down-fill"
            square
            class="ml-1 opacity-50 hover:opacity-100"
            aria-label="Open Nuxt links"
          />
        </UDropdownMenu>
      </div>
      <div class="flex items-center sm:gap-x-4 text-white font-medium">
        <UButton
          class="flex items-center sm:-mr-2"
          to="https://go.nuxt.com/discord"
          target="_blank"
          variant="link"
          color="neutral"
          size="xl"
          aria-label="Join the Nuxt Discord"
        >
          <UIcon
            name="i-simple-icons-discord"
            class="h-5 w-5"
          />
          <span class="hidden sm:block">Join us</span>
        </UButton>
        <div class="hidden sm:block h-8 w-px bg-neutral-700 -mr-2 sm:-mr-6" />
        <UButton
          to="https://go.nuxt.com/github"
          class="flex gap-x-2 items-center"
          variant="link"
          color="neutral"
          size="xl"
          target="_blank"
          aria-label="Star Nuxt on GitHub"
        >
          <UIcon
            name="i-simple-icons-github"
            class="h-5 w-5 sm:ml-4"
          />
          <span class="hidden sm:block">Star us</span>
        </UButton>
      </div>
    </UContainer>
  </div>
</template>
