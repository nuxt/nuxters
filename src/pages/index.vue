<script setup lang="ts">
import { getSession } from 'h3'

type Provider = 'github' | 'discord'

const linked = useState<{ [key in Provider]: boolean }>()
const contributions = useState<string>()
const githubUsername = useState<string>()
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
  githubUsername.value = event.context.githubUsername
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

const sharedUrl = computed(() => {
  if (typeof window !== 'undefined' && githubUsername.value) {
    return window.location.origin + '/nuxter/' + githubUsername.value
  }
  return ''
})

const copied = ref(false)
let timeoutId
function copyShareUrl() {
  navigator.clipboard
    .writeText(sharedUrl.value)
    .then(() => {
      copied.value = true
      timeoutId = setTimeout(() => {
        copied.value = false
      }, 4000)
    })
    // silently fails
    .catch(() => {})
}

onBeforeUnmount(() => {
  timeoutId && clearTimeout(timeoutId)
})
</script>
<template>
  <div>
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
          <div class="w-3 h-3" :class="link.icon" />
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
              <div class="i-ri-star-fill w-3 h-3 text-yellow" />
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
                <span v-if="refreshing === 'nuxter'" class="block i-ri-refresh-line animate-spin w-4 h-4" />
                <span v-else class="block i-ri-lock-line w-4 h-4" />
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
            <span
              class="block i-ri-refresh-line ml-auto w-4 h-4"
              :class="{ 'animate-spin': refreshing === provider }"
            />
          </a>
        </div>
      </template>
    </div>
    <div v-if="linked.github" class="w-full py-4 px-1 flex flex-col gap-2">
      <div class="text-sm">
        <span class="i-ri-twitter-fill w-4 h-4 text-blue inline-block mr-1"></span>
        Share that you're a Nuxter!
      </div>
      <button
        type="button"
        @click.native="copyShareUrl()"
        class="rounded-lg flex border-gray-700 border-[1px] bg-black backdrop-blur-sm to-transparent w-full"
      >
        <div class="flex-grow px-3 py-2">{{ sharedUrl }}</div>
        <div
          class="ml-auto w-60px text-center justify-center flex items-center rounded border-[1px] text-green-400 bg-green-400 bg-opacity-[0.1] hover:bg-opacity-[0.2] border-green-400 border-opacity-[0.1] transition-all hover:border-opacity-[0.7] p-2"
        >
          <span v-if="!copied">Copy</span>
          <span v-else class="i-ri-check-fill w-6 h-6 inline-block animate-light-speed-in-left"> </span>
        </div>
      </button>
    </div>
  </div>
</template>
