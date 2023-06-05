<script setup lang="ts">
import { getSession } from 'h3'

type Provider = 'github' | 'discord'

const linked = useState<{ [key in Provider]: boolean }>()
const contributions = useState<string>()
const roles = useState<string[]>()

if (process.server) {
  const event = useRequestEvent()
  const session = await getSession(event, { password: useRuntimeConfig().sessionPassword })
  linked.value = {
    github: !!session?.data.githubId,
    discord: !!session?.data.discordId,
  }
  const formatter = Intl.NumberFormat('en-GB', { notation: 'compact', compactDisplay: 'short' })
  contributions.value = formatter.format(event.context.contributions || 0)
  roles.value = event.context.roles || []
}

const refreshing = ref()

const links = {
  github: {
    name: 'GitHub',
    icon: 'i-ri-github-fill',
    link: '/connect/github',
  },
  discord: {
    name: 'Discord',
    icon: 'i-ri-discord-fill',
    link: '/connect/discord',
  },
} satisfies Record<Provider, any>
</script>

<template>
  <Html class="bg-black text-white font-sans" />
  <div class="relative max-w-5xl w-full mx-auto px-2 md:px-6">
    <Spotlight class="z-[1]" />
    <div class="z-[2] relative flex flex-col min-h-screen items-center py-4 md:justify-center pb-8">
      <article
        class="rounded-lg border-gray-800 border-[1px] px-4 py-4 bg-gradient-to-r from-[rgba(24,24,27,0.65)] backdrop-blur-sm to-transparent max-w-[40rem] w-full"
      >
        <img src="/icon.svg" class="w-5 h-5" height="20" width="20" alt="" />
        <div class="font-bold mt-4 flex flex-row gap-2 items-center">
          <span> You are a star </span>
        </div>
        <p class="font-thin">Link your GitHub and Discord accounts.</p>
        <p class="font-thin mt-1 opacity-50">
          Your details are stored in a cookie and only used to grant you roles on Discord.
        </p>
        <div class="grid gap-5 text-sm mt-4 grid-cols-1 md:grid-cols-2 items-start">
          <template v-for="(link, provider) in links" :key="provider">
            <a
              v-if="!linked[provider]"
              :href="link.link"
              class="flex mr-auto gap-2 items-center px-3 py-2 rounded border-[1px] bg-white bg-opacity-[0.1] hover:bg-opacity-[0.2] border-white border-opacity-[0.1] transition-all hover:border-opacity-[0.7]"
            >
              <div class="w-4 h-4" :class="link.icon" />
              Link {{ link.name }} account
            </a>
            <div
              v-else
              class="flex gap-2 items-start px-1 rounded border-[1px] border-transparent border-opacity-[0.1] transition-all hover:border-opacity-[0.7]"
            >
              <div class="flex gap-2 flex-col">
                <div class="flex gap-2">
                  <div class="w-4 h-4" :class="link.icon" />
                  {{ link.name }} linked
                </div>
                <div
                  v-if="provider === 'github'"
                  class="text-xs rounded border-[1px] text-gray-400 bg-gray-400 bg-opacity-[0.1] border-gray-400 border-opacity-[0.1] py-1 px-2 mr-auto flex gap-1 items-center"
                >
                  <div class="i-ri-star-fill w-4 h-4 text-yellow" />
                  {{ contributions }} contributions
                </div>
                <template v-if="provider === 'discord'">
                  <div v-if="roles.length" class="mr-auto flex gap-2">
                    <div
                      v-for="role in roles"
                      class="text-xs rounded border-[1px] text-gray-400 bg-gray-400 bg-opacity-[0.1] border-gray-400 border-opacity-[0.1] py-1 px-2 mr-auto flex gap-2 items-center"
                    >
                      <div class="rounded-full h-2 w-2 bg-green"></div>
                      {{ role }}
                    </div>
                  </div>
                  <a
                    v-else-if="linked.github && linked.discord && contributions !== '0'"
                    href="/grant"
                    class="text-xs rounded border-[1px] text-green-400 bg-green-400 bg-opacity-[0.1] hover:bg-opacity-[0.2] border-green-400 border-opacity-[0.1] transition-all hover:border-opacity-[0.7] p-1 flex gap-1 items-center"
                    @click.native="refreshing = 'nuxter'"
                  >
                    <div v-if="refreshing === 'nuxter'" class="i-ri-refresh-line animate-spin w-4 h-4" />
                    <div v-else class="i-ri-lock-line w-4 h-4" />
                    Unlock nuxter role
                  </a>
                </template>
              </div>
              <a
                class="ml-auto rounded border-[1px] text-green-400 bg-green-400 bg-opacity-[0.1] hover:bg-opacity-[0.2] border-green-400 border-opacity-[0.1] transition-all hover:border-opacity-[0.7] p-2"
                :href="link.link + '?refresh=1'"
                @click.native="refreshing = provider"
              >
                <span class="sr-only">Refresh link</span>
                <div class="i-ri-refresh-line ml-auto w-4 h-4" :class="{ 'animate-spin': refreshing === provider }" />
              </a>
            </div>
          </template>
        </div>
      </article>
    </div>
    <a href="https://nuxt.com" class="-mt-8 mb-4 opacity-50 flex justify-center">
      <span class="sr-only">Nuxt</span>
      <img class="h-4" width="132" height="32" src="/nuxt.svg" />
    </a>
  </div>
</template>
