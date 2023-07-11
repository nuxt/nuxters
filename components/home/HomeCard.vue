<script setup lang="ts">
import { getSession } from 'h3'
import type { Contributor } from '~/types'

type Provider = 'github' | 'discord'

const isOpen = ref(false)
const linked = useState<{ [key in Provider]: boolean }>(() => ({ github: false, discord: false }))
const contributor = useState<Contributor>()
const canUnlockBadge = useState<boolean>(()=> false)
const hasMergedPullRequests = useState<boolean>(() => false)
const hasHelpfulIssues = useState<boolean>(() => false)
const hasHelpfulComments = useState<boolean>(() => false)
const detailedScore = useState<any>(() => [])
// const { format } = Intl.NumberFormat('en-GB', { notation: 'compact', compactDisplay: 'short' })
const { format } = Intl.NumberFormat('en-GB', { })

if (process.server) {
  const event = useRequestEvent()
  const session = await getSession(event, { password: useRuntimeConfig().sessionPassword })
  linked.value = {
    github: !!session?.data.githubId,
    discord: !!session?.data.discordId,
  }
  contributor.value = event.context.contributor
  canUnlockBadge.value = event.context.canUnlockBadge
  // If user has contributions
  if (contributor.value) {
    hasMergedPullRequests.value = contributor.value.merged_pull_requests > 0
    hasHelpfulIssues.value = contributor.value.helpful_issues > 0
    hasHelpfulComments.value = contributor.value.helpful_comments > 0
    detailedScore.value = [
      {
        type: 'Merged pull requests',
        multiplier: 5,
        amount: format(contributor.value.merged_pull_requests),
        total: format(contributor.value.merged_pull_requests * 5),
      },
      {
        type: 'Helpful issues',
        multiplier: 3,
        amount: format(contributor.value.helpful_issues),
        total: format(contributor.value.helpful_issues * 3),
      },
      {
        type: 'Helpful comments',
        multiplier: 2,
        amount: format(contributor.value.helpful_comments),
        total: format(contributor.value.helpful_comments * 2),
      },
      {
        type: 'Issues',
        multiplier: 1,
        amount: format(contributor.value.issues),
        total: format(contributor.value.issues),
      },
      {
        type: 'Comments',
        multiplier: 0.5,
        amount: format(contributor.value.comments),
        total: format(contributor.value.comments * 0.5),
      },
      {
        type: 'Reactions',
        multiplier: 0.1,
        amount: format(contributor.value.reactions),
        total: format(contributor.value.reactions * 0.1),
      },
      {
        type: 'Score',
        multiplier: '',
        amount: '',
        total: format(contributor.value.score),
      }
    ]
  }
}
</script>

<template>
  <div
    class="relative w-full md:max-w-[400px] lg:max-w-[600px] min-h-[300px] md:min-h-[350px] lg:min-h-[222px]"
    :class="linked['github'] && canUnlockBadge ? 'card-border p-[1px]' : 'border border-gray-800 rounded-lg'"
  >
    <UCard
      :ui="{ ring: 'ring-0', body: { base: 'w-full h-full p-0' } }"
      class="z-50 !bg-gray-950 card p-4 rounded-[9.5px] flex items-center justify-center self-start md:max-w-[400px] lg:max-w-[600px] min-h-[300px] md:min-h-[350px] lg:min-h-[222px]"
    >
      <!--github connect -->
      <div v-if="!linked['github']" class="flex gap-y-6 flex-col justify-center items-center">
        <p class="text-xl text-gray-50 text-center">Unlock your role on Nuxt Discord server.</p>
        <UButton icon="i-simple-icons-github" :ui="{ rounded: 'rounded-full' }"
          class="relative px-7 max-w-fit hover:bg-gray-700" variant="outline" color="gray">
          <a href="/connect/github" class="absolute inset-0 w-full h-full" />
          <span class="text-sm text-gray-300">Connect with GitHub</span>
        </UButton>
      </div>

      <!-- linked to github -->
      <div v-else-if="linked['github']" class="w-full h-full">
        <img v-if="canUnlockBadge" src="/card-gradient-bg.svg" class="absolute inset-0 w-full h-full" />
        <div class="absolute right-2 top-2"><UButton class="transitions-colors duration-200" to="/logout" external size="xs" icon="i-ph-power" label="logout" color="gray" variant="ghost"/></div>
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
                ? 'i-ph-smiley'
                : !linked['discord']
                ? 'i-simple-icons-discord'
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
          class="flex flex-col items-start sm:items-center md:items-center sm:grid sm:grid-cols-2 md:flex md:flex-col lg:grid gap-y-6 lg:grid-cols-2 justify-center w-full h-full">
          <div class="flex flex-col gap-y-4 justify-center w-full">
            <UAvatar :src="`https://avatars.githubusercontent.com/u/${contributor.githubId}`" size="2xl" :alt="contributor.username" />
            <span class="text-white text-2xl">{{ contributor.username }}</span>
            <span class="bg-gray-700 w-10 h-[1px]" />
            <div class="flex items-center">
              <span class="text-white text-lg">{{ format(contributor.score) }}<span class="text-base text-gray-200 pl-[3px]">pts</span></span>
              <UButton variant="ghost" icon="i-ph-info" color="gray" @click="isOpen = true" class="ml-1 transitions-color duration-200" />
              <UModal
                class="relative"
                v-model="isOpen"
                :ui="{
                  background: 'bg-gray-900',
                  container: 'flex min-h-full justify-center text-center',
                  padding: 'p-0',
                  overlay: { background: 'backdrop-blur bg-gray-800/70' },
                }">
                <UButton
                  class="absolute right-2 top-2 transition-colors duration-200"
                  color="white"
                  variant="ghost"
                  size="xl"
                  icon="i-ph-x"
                  @click="isOpen = false"
                />
                <div class="flex flex-col justify-center gap-y-2 text-gray-300 text-lg">
                  <h5 class="text-2xl text-white font-medium px-4 py-3 pr-10 bg-gray-950">How is the score calculated?</h5>
                  <UTable class="overflow-x-auto" :rows="detailedScore" :ui="{
                    th: {
                      base: 'first:text-left text-center last:text-right',
                      padding: 'px-4 py-3.5',
                    },
                    td: {
                      base: 'first:text-left text-center last:text-right whitespace-nowrap',
                      padding: 'px-4 py-3.5',
                    },
                    tr: {
                      base: 'last:font-bold'
                    }
                  }" />
                </div>
              </UModal>
            </div>
          </div>

          <div class="flex flex-col gap-y-6 text-gray-300 w-full">
            <div class="flex items-center justify-between w-full">
              <span
                ><span class="text-white font-medium">{{ format(contributor.merged_pull_requests) }}</span> merged pull request{{ contributor.merged_pull_requests > 1 ? 's' : '' }}</span
              >
              <UCheckbox
                :ui="{
                  base: 'h-5 w-5',
                }"
                disabled
                v-model="hasMergedPullRequests"
              />
            </div>
            <div class="flex items-center justify-between">
              <span
                ><span class="text-white font-medium">{{ format(contributor.helpful_issues) }}</span> helpful issue{{ contributor.helpful_issues > 1 ? 's' : '' }}</span
              >
              <UCheckbox
                :ui="{
                  base: 'h-5 w-5',
                }"
                v-model="hasHelpfulIssues"
                disabled
              />
            </div>
            <div class="flex items-center justify-between">
              <span
                ><span class="text-white font-medium">{{ format(contributor.helpful_comments) }}</span> helpful comment{{ contributor.helpful_comments > 1 ? 's' : '' }}</span
              >
              <UCheckbox
                :ui="{
                  base: 'h-5 w-5',
                }"
                v-model="hasHelpfulComments"
                disabled
              />
            </div>
          </div>
        </div>
      </div>
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
  border-radius: 10px;
  /* Ajustez le border radius selon vos besoins */
  background-image: linear-gradient(to bottom right, #00dc82, #1e293b);
  z-index: -1;
}
</style>
