<script setup lang="ts">
import { getSession } from 'h3'

type Provider = 'github' | 'discord'

const { data: usersStats } = await useFetch('https://api.nuxt.com/contributors')

const isOpen = ref(false)
const linked = useState<{ [key in Provider]: boolean }>()
const contributions = useState<string>()
const avatarUrl = useState<string>()
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
  avatarUrl.value = event.context.avatarUrl
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
const user = computed(
  () => usersStats.value.filter(user => user.username.toLowerCase() === githubUsername.value.toLowerCase())[0]
)
const asUnlockBadge = computed(
  () => user.value.helpful_comments > 0 || user.value.helpful_issues > 0 || user.value.merged_pull_requests > 0
)
const helpfulComments = computed(() => user.value.helpful_comments > 0)
const helpfulIssues = computed(() => user.value.helpful_issues > 0)
const mergedPullRequests = computed(() => user.value.merged_pull_requests > 0)

onBeforeUnmount(() => {
  timeoutId && clearTimeout(timeoutId)
})
</script>
<template>
  <div class="relative w-full md:max-w-[400px] lg:max-w-[600px] min-h-[300px] md:min-h-[350px] lg:min-h-[300px]" :class="linked['github'] && asUnlockBadge ? 'card-border p-[1px]' : 'border border-gray-800 rounded-lg'">
    <UCard
      :ui="{ ring: 'ring-0', body: { base: 'w-full h-full p-0' } }"
      class="z-50 !bg-gray-950 card p-8 rounded-[10px] flex items-center justify-center self-start md:max-w-[400px] lg:max-w-[600px] min-h-[300px] md:min-h-[350px] lg:min-h-[300px]"
    >
      <!-- .1 not connected to github => github connect -->
      <div v-if="!linked['github']" class="flex gap-y-6 flex-col justify-center items-center">
        <p class="text-xl text-gray-50">Unlock your role on Nuxt Discord server.</p>
        <UButton
          icon="i-bx-bxl-github"
          :ui="{ rounded: 'rounded-full' }"
          class="relative px-7 max-w-fit hover:bg-gray-700"
          variant="outline"
          color="gray"
        >
          <a href="/connect/github" class="absolute inset-0 w-full h-full" />
          <span class="text-sm text-gray-300">Connect with GitHub</span>
        </UButton>
      </div>

      <!-- 2. connected github and you have possibility to get badge => connect to discord || 3. connected to github and you have badge -->
      <div v-else-if="linked['github']" class="w-full h-full">
        <img v-if="asUnlockBadge" src="/card-gradient-bg.svg" class="absolute inset-0 w-full h-full" />

        <div class="absolute left-0 right-0 flex justify-center -bottom-4">
          <UButton
            class="relative"
            :class="[
              asUnlockBadge ? 'primary-button' : 'bg-gray-900',
              { 'cursor-auto hover:bg-gray-950': linked['discord'] || !asUnlockBadge },
              { 'primary-button-discord': !linked['discord'] && asUnlockBadge },
            ]"
            :color="asUnlockBadge ? 'primary' : 'gray'"
            variant="outline"
            :icon="
              !asUnlockBadge
                ? 'i-bx-smile'
                : !linked['discord']
                ? 'i-bx-bxl-discord-alt'
                : 'i-heroicons-check-circle-solid'
            "
          >
            <a
              v-if="!linked['discord'] && asUnlockBadge"
              href="/connect/discord"
              class="absolute inset-0 w-full h-full"
            />
            <span class="text-sm text-gray-300">{{
              !asUnlockBadge ? "you're almost there, keep going!" : !linked['discord'] ? 'Unlock badge' : 'Nuxter role'
            }}</span>
          </UButton>
        </div>

        <div
          class="flex flex-col items-start sm:items-center md:items-center sm:grid sm:grid-cols-2 md:flex md:flex-col lg:grid gap-y-6 lg:grid-cols-2 justify-center w-full h-full"
        >
          <div class="flex flex-col gap-y-4 justify-center w-full">
            <UAvatar :src="avatarUrl" size="2xl" :alt="user.username" />
            <span class="text-white text-2xl">{{ user.username }}</span>
            <span class="bg-gray-700 w-10 h-[1px]" />
            <div class="flex gap-x-2 items-center">
              <span class="text-white text-lg">score: {{ user.score }}</span>

              <UButton variant="link" icon="i-bx-info-circle" color="gray" @click="isOpen = true" />
              <UModal
                class="relative"
                v-model="isOpen"
                :ui="{ background: 'bg-gray-900', overlay: { background: 'backdrop-blur bg-gray-800/70' } }"
              >
                <UButton
                  class="absolute right-2 top-2 transition-colors duration-200"
                  color="black"
                  size="xl"
                  icon="i-bx-x-circle"
                  @click="isOpen = false"
                />
                <div class="flex flex-col justify-center gap-y-2 text-gray-300 text-lg p-8">
                  <h5 class="text-2xl text-white font-medium text-center pb-4">How is the score calculated?</h5>
                  <span class="pl-4">Issues * 1</span>
                  <span>+ Merged pull requests * 0.5</span>
                  <span>+ Helpful issues * 3</span>
                  <span>+ Helpful comments * 2</span>
                  <span>+ Reactions * 0.1</span>
                </div>
              </UModal>
            </div>
          </div>

          <div class="flex flex-col gap-y-6 text-gray-300 w-full">
            <div class="flex items-center justify-between w-full">
              <span
                ><span class="text-white font-medium">{{ user.merged_pull_requests }}</span> Merged Pull Requests</span
              >
              <UCheckbox
                :ui="{
                  base: 'h-5 w-5',
                }"
                disabled
                v-model="mergedPullRequests"
              />
            </div>
            <div class="flex items-center justify-between">
              <span
                ><span class="text-white font-medium">{{ user.helpful_issues }}</span> Helpful issue</span
              >
              <UCheckbox
                :ui="{
                  base: 'h-5 w-5',
                }"
                v-model="helpfulIssues"
                disabled
              />
            </div>
            <div class="flex items-center justify-between">
              <span
                ><span class="text-white font-medium">{{ user.helpful_comments }}</span> Helpful Comment</span
              >
              <UCheckbox
                :ui="{
                  base: 'h-5 w-5',
                }"
                v-model="helpfulComments"
                disabled
              />
            </div>
          </div>
        </div>
      </div>
      <!-- <p class="font-thin">Link your GitHub and Discord accounts.</p>
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
      </div> -->
    </UCard>
  </div>
</template>

<style lang="postcss">
.card {
  background: linear-gradient(180deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.5) 100%);
}

.form-checkbox {
  background: linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)),
    linear-gradient(0deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.form-checkbox:checked {
  display: flex !important;
  border-radius: 4px !important;
  border: 1px solid  #00dc82 !important;
  //background: rgba(0, 220, 130, 0.10) !important;
  background-position: center;
  background-image: url('/check.svg') !important;
}

.disabled\:opacity-50:disabled {
  opacity: 1;
}

.disabled\:cursor-not-allowed:disabled {
  cursor: auto;
}

.primary-button {
  box-shadow: 0 0 4px 1px #00dc82;
}

.primary-button-discord:hover {
  box-shadow: none;
}

.card-border {
  position: relative;
}

.card-border::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 10px; /* Ajustez le border radius selon vos besoins */
  background-image: linear-gradient(to bottom right, #00dc82, #1e293b);
  z-index: -1;
}
</style>
