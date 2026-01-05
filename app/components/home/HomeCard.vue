<script setup lang="ts">
import ConfettiExplosion from 'vue-confetti-explosion'
import type { TableColumn } from '@nuxt/ui'
import type { Score } from '#shared/types'

const {
  linked,
  contributor,
  canUnlockNuxterBadge,
  canUnlockModuleBadge,
  canUnlockUIProBadge,
  hasMergedPullRequests,
  hasHelpfulIssues,
  hasHelpfulComments,
  detailedScore,
} = useNuxter()
const format = useNumberFormatter()
const showConfetti = ref(false)
const badgeName = computed(() => {
  const badges = []
  if (canUnlockNuxterBadge.value) badges.push('Nuxter')
  if (canUnlockModuleBadge.value) badges.push('Module Author')
  if (canUnlockUIProBadge.value) badges.push('UI Pro')
  if (badges.length > 0) return badges.join(' + ') + ' badge' + (badges.length > 1 ? 's' : '') + ' unlocked'
  return 'You\'re almost there, keep going!'
})
const canUnlockADiscordBadge = computed(() => {
  return canUnlockNuxterBadge.value || canUnlockModuleBadge.value || canUnlockUIProBadge.value
})
async function popConfetti() {
  showConfetti.value = false
  await nextTick()
  showConfetti.value = true
}
function unlockButton(e: MouseEvent) {
  e.stopPropagation()
  if (linked.value.discord && canUnlockNuxterBadge) {
    popConfetti()
  }
}
onMounted(() => {
  if (linked.value.discord && canUnlockNuxterBadge) {
    popConfetti()
  }
})

const columns: TableColumn<Score>[] = [
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => row.getValue('type'),
  },
  {
    accessorKey: 'multiplier',
    header: 'Multiplier',
    cell: ({ row }) => row.getValue('multiplier'),
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => row.getValue('amount'),
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => row.getValue('total'),
  },
]
</script>

<template>
  <div
    class="relative w-full md:max-w-100 lg:max-w-150 min-h-75 md:min-h-87.5 lg:min-h-55.5"
  >
    <UPageCard
      class="md:max-w-100 lg:max-w-150 min-h-75 md:min-h-87.5 lg:min-h-55.5"
      :class="{ 'hover:ring-primary/60': linked.github && canUnlockNuxterBadge }"
      :to="!!linked.github ? `/${contributor.username}` : undefined"
    >
      <!-- github connect -->
      <div
        v-if="!linked.github"
        class="flex gap-y-6 flex-col justify-center items-center"
      >
        <p class="text-xl text-neutral-50 text-center">
          Unlock your role on Nuxt Discord server.
        </p>
        <UButton
          icon="i-simple-icons-github"
          class="relative px-7 max-w-fit hover:bg-neutral-700"
          variant="outline"
          color="neutral"
          aria-label="connect with GitHub"
          label="Connect with GitHub"
          to="/connect/github"
          external
        />
      </div>

      <!-- linked to github -->
      <div
        v-else-if="linked.github"
        class="w-full h-full"
      >
        <img
          v-if="canUnlockNuxterBadge"
          src="/card-gradient-bg.svg"
          class="absolute inset-0 w-full rounded-lg"
          alt=""
        >
        <div class="absolute right-2 top-2 z-50">
          <UButton
            class="transitions-colors duration-200"
            to="/logout"
            external
            size="xs"
            icon="i-ph-power"
            label="logout"
            color="neutral"
            variant="ghost"
            @click.stop
          />
        </div>
        <div class="absolute left-0 right-0 flex justify-center bottom-0">
          <ConfettiExplosion
            v-if="showConfetti"
            :force="0.7"
            :colors="['#00DC82']"
            :particle-size="4"
            :particle-count="200"
          />
        </div>
        <div class="absolute left-0 right-0 flex justify-center -bottom-4 gap-x-2 px-2">
          <UButton
            class="relative z-50 truncate"
            color="neutral"
            variant="outline"
            :icon="
              !canUnlockADiscordBadge
                ? 'i-ph-smiley'
                : !linked.discord
                  ? 'i-simple-icons-discord'
                  : 'i-heroicons-check-circle-solid'
            "
            :aria-label="linked.discord ? badgeName : 'Unlock badge(s)'"
            :label="linked.discord ? badgeName : 'Unlock badge(s)'"
            :to="!linked.discord ? '/connect/discord' : undefined"
            external
            @click="unlockButton"
          />
          <UButton
            v-if="linked.github"
            color="neutral"
            variant="outline"
            class="hidden xl:flex z-50"
            icon="i-ph-share-network"
            aria-label="Share my Nuxter profile"
            :to="`/${contributor.username}`"
            label="Share my Nuxter profile"
            @click.stop
          />
        </div>

        <div
          class="flex flex-col items-start sm:items-center md:items-center sm:grid sm:grid-cols-2 md:flex md:flex-col lg:grid gap-y-6 lg:grid-cols-2 justify-center w-full h-full"
        >
          <div class="flex flex-col gap-y-4 justify-center w-full">
            <UAvatar
              :src="contributor.username"
              size="2xl"
              :alt="contributor.username"
              class="z-10"
            />
            <span class="text-white text-2xl">{{ contributor.username }}</span>
            <span class="bg-neutral-700 w-10 h-px" />
            <div class="flex items-center">
              <span class="text-white text-lg">{{ format(contributor.score) }}<span class="text-base text-neutral-200 pl-0.75">pts</span></span>

              <UModal
                class="relative"
                title="How is the score calculated?"
                :ui="{
                  body: 'p-0 sm:p-0',
                }"
              >
                <UButton
                  variant="ghost"
                  icon="i-ph-info"
                  color="neutral"
                  class="ml-1 transitions-color duration-200 z-10"
                  aria-label="show score table"
                />
                <template #body>
                  <UTable
                    class="overflow-x-auto"
                    :data="detailedScore"
                    :columns="columns"
                  />
                </template>
              </UModal>
            </div>
          </div>

          <div class="flex flex-col gap-y-6 text-neutral-300 w-full">
            <div class="flex items-center justify-between gap-2 w-full">
              <span><span class="text-white font-medium">{{ format(contributor.merged_pull_requests) }}</span> merged pull request{{ contributor.merged_pull_requests > 1 ? 's' : '' }}</span>
              <UCheckbox
                v-model="hasMergedPullRequests"
                :ui="{
                  base: 'h-5 w-5',
                }"
                disabled
              />
            </div>
            <div class="flex items-center justify-between gap-2">
              <span><span class="text-white font-medium">{{ format(contributor.helpful_issues) }}</span> helpful issue{{ contributor.helpful_issues > 1 ? 's' : '' }}</span>
              <UCheckbox
                v-model="hasHelpfulIssues"
                :ui="{
                  base: 'h-5 w-5',
                }"
                disabled
              />
            </div>
            <div class="flex items-center justify-between gap-2">
              <span><span class="text-white font-medium">{{ format(contributor.helpful_comments) }}</span> helpful comment{{ contributor.helpful_comments > 1 ? 's' : '' }}</span>
              <UCheckbox
                v-model="hasHelpfulComments"
                :ui="{
                  base: 'h-5 w-5',
                }"
                disabled
              />
            </div>
          </div>
        </div>
      </div>
    </UPageCard>
  </div>
</template>
