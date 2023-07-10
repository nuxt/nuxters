<template>
  <div class="text-white">
    <h1 class="text-6xl font-bold mb-8">Are you a <span class="text-green-400">Nuxter</span>?</h1>
    <div class="flex flex-col gap-y-[60px] md:justify-between md:flex-row items-center gap-x-[92px]">
      <div class="flex flex-col gap-y-4">
        <p class="text-lg">
          Discover your contributions on
          <NuxtLink to="https://github.com/nuxt/nuxt" target="_blank"> <span class="underline">nuxt</span></NuxtLink>
          and
          <NuxtLink to="https://github.com/nuxt/modules" target="_blank"
            ><span class="underline">nuxt modules</span></NuxtLink
          ><br />organisations to unlock a role on the <NuxtLink to="https://discord.com/invite/nuxt" target="_blank"><span class="underline">Nuxt Discord server</span></NuxtLink>.
        </p>
        <div>
          <div class="mb-2">Unlock it by having either:</div>
          <ul class="flex flex-col gap-y-1 pt-1 text-base">
            <li v-for="item in unlockList" :key="item" class="flex gap-x-2">
              <UIcon name="i-heroicons-check-circle-20-solid" class="h-5 w-5" />
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
      </div>
      <HomeCard />
    </div>
  </div>
</template>

<script setup lang="ts">
const unlockList = ['1 pull request merged', '1 helpful issue (3+ reactions)', '1 helpful comment (3+ reactions)']
</script>
