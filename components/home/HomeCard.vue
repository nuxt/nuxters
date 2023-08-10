<script setup lang="ts">
import type { Contributor } from '~/types'

type Provider = 'github' | 'discord'

const isOpen = ref(false)
const {
  linked,
  contributor,
  canUnlockBadge,
  hasMergedPullRequests,
  hasHelpfulIssues,
  hasHelpfulComments,
  detailedScore,
} = useNuxter()
const { format } = Intl.NumberFormat('en-GB', { })
</script>

<template>
  <div
    class="relative w-full md:max-w-[400px] lg:max-w-[600px] min-h-[300px] md:min-h-[350px] lg:min-h-[222px]"
    :class="linked['github'] && canUnlockBadge ? 'hover:border-green-400 card-border p-[1px]' : 'border border-gray-800 rounded-lg'"
    @click="linked.github ? $router.push(`/${contributor.username}`) : ''"
  >
    <UCard
      :ui="{ ring: 'ring-0', body: { base: 'w-full h-full p-0' } }"
      class="!bg-gray-950 card p-4 rounded-[9.5px] flex items-center justify-center self-start md:max-w-[400px] lg:max-w-[600px] min-h-[300px] md:min-h-[350px] lg:min-h-[222px]"
      :class="{ 'cursor-pointer': linked.github }"
    >
      <!--github connect -->
      <div v-if="!linked['github']" class="flex gap-y-6 flex-col justify-center items-center">
        <p class="text-xl text-gray-50 text-center">Unlock your role on Nuxt Discord server.</p>
        <UButton icon="i-simple-icons-github" :ui="{ rounded: 'rounded-full' }"
          class="relative px-7 max-w-fit hover:bg-gray-700" variant="outline" color="gray" aria-label="connect with GitHub">
          <a href="/connect/github" class="absolute inset-0 w-full h-full" aria-label="connect with GitHub" />
          <span class="text-sm text-gray-300">Connect with GitHub</span>
        </UButton>
      </div>

      <!-- linked to github -->
      <div v-else-if="linked['github']" class="w-full h-full">
        <img v-if="canUnlockBadge" src="/card-gradient-bg.svg" class="absolute inset-0 w-full" alt="" />
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
             :aria-label="!canUnlockBadge ? 'you\'re almost there, keep going!' : !linked['discord'] ? 'Unlock badge' : 'Nuxter role'"
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
              <UButton variant="ghost" icon="i-ph-info" color="gray" @click.stop="isOpen = true" class="ml-1 transitions-color duration-200 z-50" aria-label="show score table" />
              <UModal
                class="relative"
                v-model="isOpen"
                :ui="{
                  background: 'bg-gray-900',
                  container: 'flex min-h-full md:items-center justify-center text-center',
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

.card-border:hover::before {
  background:  #00dc82;
}
</style>
