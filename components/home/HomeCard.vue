<script setup lang="ts">
import { getSession } from 'h3'
import type { UserStat } from 'types'

type Provider = 'github' | 'discord'

const { data: usersStats } = await useFetch<Array<UserStat>>('https://api.nuxt.com/contributors')

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

const user = computed(() => usersStats.value!.filter(user => user.username.toLowerCase() === githubUsername.value.toLowerCase())[0])
const canUnlockBadge = computed(() => user.value.helpful_comments > 0 || user.value.helpful_issues > 0 || user.value.merged_pull_requests > 0)
const helpfulComments = computed(() => user.value.helpful_comments > 0)
const helpfulIssues = computed(() => user.value.helpful_issues > 0)
const mergedPullRequests = computed(() => user.value.merged_pull_requests > 0)
</script>

<template>
  <NuxtLink
    class="relative w-full md:max-w-[400px] lg:max-w-[600px] min-h-[300px] md:min-h-[350px] lg:min-h-[300px]"
    :class="linked['github'] && canUnlockBadge ? 'card-border p-[1px]' : 'border border-gray-800 rounded-lg'"
  >
    <UCard
      :ui="{ ring: 'ring-0', body: { base: 'w-full h-full p-0' } }"
      class="z-50 !bg-gray-950 card p-8 rounded-[9.5px] flex items-center justify-center self-start md:max-w-[400px] lg:max-w-[600px] min-h-[300px] md:min-h-[350px] lg:min-h-[300px]"
    >
      <!--github connect -->
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

      <!-- linked to github -->
      <div v-else-if="linked['github']" class="w-full h-full">
        <img v-if="canUnlockBadge" src="/card-gradient-bg.svg" class="absolute inset-0 w-full h-full" />

        <div class="absolute left-0 right-0 flex justify-center -bottom-4">
          <UButton
            class="relative"
            :class="[
              canUnlockBadge ? 'primary-button' : 'bg-gray-900',
              { 'cursor-auto hover:bg-gray-950': linked['discord'] || !canUnlockBadge },
              { 'primary-button-discord': !linked['discord'] && canUnlockBadge },
            ]"
            :color="canUnlockBadge ? 'primary' : 'gray'"
            variant="outline"
            :icon="
              !canUnlockBadge
                ? 'i-bx-smile'
                : !linked['discord']
                ? 'i-bx-bxl-discord-alt'
                : 'i-heroicons-check-circle-solid'
            "
          >
            <a
              v-if="!linked['discord'] && canUnlockBadge"
              href="/connect/discord"
              class="absolute inset-0 w-full h-full"
            />
            <span class="text-sm text-gray-300">{{
              !canUnlockBadge ? "you're almost there, keep going!" : !linked['discord'] ? 'Unlock badge' : 'Nuxter role'
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
                  color="white"
                  variant="ghost"
                  size="xl"
                  icon="i-bx-x-circle"
                  @click="isOpen = false"
                />
                <div class="flex flex-col justify-center gap-y-2 text-gray-300 text-lg p-8">
                  <h5 class="text-2xl text-white font-medium pb-4">How is the score calculated?</h5>
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
    </UCard>
  </NuxtLink>
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
  border: 1px solid #00dc82 !important;
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
  content: '';
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
