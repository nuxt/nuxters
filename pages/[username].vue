<script lang="ts" setup>
const { username } = useRoute().params
const { copy, copied } = useClipboard()

const { data: contributor } = await useFetch(`/api/contributors/${username}`)

if (!contributor.value) {
  throw createError({
    statusCode: 404,
    message: 'Contributor not found'
  })
}

const format = useNumberFormatter()

defineOgImage({
  component: 'OgImageNuxter',
  contributor
})
useSeoMeta({
  title: () => `${contributor.value?.username} is a Nuxter`,
  ogTitle: () => `${contributor.value?.username} is a Nuxter`,
  description: () => `Discover ${contributor.value?.username}'s contributions to the Nuxt ecosystem.`,
  ogDescription: () => `Discover ${contributor.value?.username}'s contributions to the Nuxt ecosystem.`,
})

const color = ref('violet')

const profileCard = ref()
const issuesCard = ref()
const commentsCard = ref()
const prsCard = ref()
const reactionsCard = ref()

const profileCardOutside = ref(useMouseInElement(profileCard).isOutside)
const greenCardOutside = ref(useMouseInElement(issuesCard).isOutside)
const commentsCardOutside = ref(useMouseInElement(commentsCard).isOutside)
const prsCardOutside = ref(useMouseInElement(prsCard).isOutside)
const reactionsCardOutside = ref(useMouseInElement(reactionsCard).isOutside)

watch(() => greenCardOutside.value, () => {
  if (greenCardOutside) color.value = 'rgba(0, 220, 130, 0.60)'
})
watch(() => commentsCardOutside.value, () => {
  if (commentsCardOutside) color.value = 'rgb(64, 187, 255, 0.60)'
})
watch(() => prsCardOutside.value, () => {
  if (prsCardOutside) color.value = 'rgba(139, 92, 246, 0.60)'
})
watch(() => reactionsCardOutside.value, () => {
  if (reactionsCardOutside) color.value = 'rgb(247, 209, 76, 0.60)'
})
</script>

<template>
  <div class="pb-[60px] lg:min-h-[calc(100dvh-9rem)] flex flex-col items-center justify-center">
    <div class="flex items-start justify-start w-full h-full my-8">
      <UButton to="/" variant="ghost" label="back to homepage" icon="i-ph-arrow-left-thin" color="gray"
        class="transition-colors duration-200" />
    </div>
    <UPageGrid v-if="contributor" :ui="{ wrapper: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full' }">
      <ULandingCard
        :ui="{ background: '', shadow: 'shadow-none', body: { base: 'gap-x-8 gap-y-4 h-full flex flex-col justify-end', padding: 'pb-4' }, title: 'text-5xl font-medium', description: 'text-2xl dark:text-white' }"
        class="profile-card relative z-40 md:col-span-2 h-full md:h-[400px] lg:h-full lg:col-span-1 lg:row-span-2 p-[1px] rounded-xl bg-transparent">
        <div
          class="profile-card flex flex-col md:flex-row lg:flex-col items-center justify-between h-full z-40 ounded-[9.5px] relative p-[18px] sm:p-[44px]">
          <div class="flex flex-col md:flex-row lg:flex-col gap-y-6 pb-2 lg:w-full items-center text-center">
            <img :src="`https://avatars.githubusercontent.com/u/${contributor.githubId}`" :alt="contributor?.username"
              class="rounded-full" />
            <div class="flex flex-col gap-y-[18px] md:ml-6 lg:ml-0">
              <UButton :to="`https://github.com/${contributor.username}`" color="gray" variant="ghost" size="lg"
                icon="i-simple-icons-github" target="_blank" :trailing="true" class="transition-colors duration-200">
                <div class="text-2xl">{{ contributor?.username }}</div>
              </UButton>

              <div class="inline-flex items-center justify-center gap-1">
                <NuxtImg src="/cup.svg" width="25" height="25" />
                <span class="text-xl text-center md:text-left lg:text-center md:ml-4 lg:ml-0"><span class="text-2xl font-medium">{{ format(contributor.score) }} {{ contributor?.score === 1 ? 'pt' : 'pts' }}</span></span>
              </div>
            </div>
            <span class="block md:hidden lg:block mb-12 lg:mb-0 h-[1px] w-[92px] bg-gray-800" />
          </div>
          <div class="flex flex-col items-center justify-center text-center gap-y-3">
            <span class="text-lg">Share your Nuxter profile ✨</span>

            <UButton @click="copy(`nuxters.nuxt.com/${contributor?.username}`)" color="gray" variant="outline" size="xl"
              :class="{ 'border-primary-400': copied }" class="max-w-[250px] m:max-w-[270px] xl:max-w-[300px]">
              <span class="truncate">{{ `nuxters.nuxt.com/${contributor?.username}` }}</span>
              <UIcon :name="copied ? 'i-ph-check' : 'i-ph-copy'" class="h-5 w-5 shrink-0"
                :class="{ 'text-green-400': copied }" />
            </UButton>
          </div>
        </div>
      </ULandingCard>

      <ULandingCard class="border-primary-400 issues-card card" ref="issuesCard"
        :ui="{ background: '', shadow: 'shadow-none', body: { base: 'gap-x-8 gap-y-4 h-full flex flex-col justify-end', padding: 'pb-4' }, title: 'text-5xl font-medium', description: 'text-2xl dark:text-white' }"
        :title="format(contributor.issues)" :description="contributor?.issues === 1 ? 'Issue' : 'Issues'">
      </ULandingCard>
      <ULandingCard class="border-blue-400 comments-card card" ref="commentsCard"
        :ui="{ background: '', shadow: 'shadow-none', body: { base: 'gap-x-8 gap-y-4 h-full flex flex-col justify-end', padding: 'pb-4' }, title: 'text-5xl font-medium', description: 'text-2xl dark:text-white' }"
        :title="format(contributor.comments)" :description="contributor?.comments === 1 ? 'Comment' : 'Comments'">
      </ULandingCard>
      <ULandingCard class="border-violet-400 pull-requests-card card" ref="prsCard"
        :ui="{ background: '', shadow: 'shadow-none', body: { base: 'gap-x-8 gap-y-4 h-full flex flex-col justify-end', padding: 'pb-4' }, title: 'text-5xl font-medium', description: 'text-2xl dark:text-white' }"
        :title="format(contributor.merged_pull_requests)"
        :description="contributor?.merged_pull_requests === 1 ? 'PR' : 'PRs'">
      </ULandingCard>
      <ULandingCard class="border-yellow-400 reactions-card card" ref="reactionsCard"
        :ui="{ background: '', shadow: 'shadow-none', body: { base: 'gap-x-8 gap-y-4 h-full flex flex-col justify-end', padding: 'pb-4' }, title: 'text-5xl font-medium', description: 'text-2xl dark:text-white' }"
        :title="format(contributor.reactions)" :description="contributor?.reactions === 1 ? 'Reaction' : 'Reactions'">
      </ULandingCard>
    </UPageGrid>
  </div>
</template>

<style scoped lang="postcss">
.background-gradient::before {
  background: radial-gradient(450px circle at var(--x) var(--y),
      v-bind(color) 0%,
      transparent 100%);
  will-change: background;
}

.card {
  @apply rounded-xl border h-[285px] bg-no-repeat bg-top text-center flex flex-col items-center justify-end;
}

.issues-card {
  background-image: linear-gradient(180deg, rgba(0, 220, 130, 0.40) 0%, rgba(0, 220, 130, 0.00) 100%, rgba(2, 4, 32, 0.50)), url('/issues-card-bg.svg');
}

.comments-card {
  background-image: linear-gradient(180deg, rgba(64, 187, 255, 0.40) 0%, rgba(64, 187, 255, 0.00) 100%, rgba(2, 4, 32, 0.50)), url('/comments-card-bg.svg');
}

.pull-requests-card {
  background-image: linear-gradient(180deg, rgba(139, 92, 246, 0.40) 0%, rgba(139, 92, 246, 0.00) 100%, rgba(2, 4, 32, 0.50)), url('/pull-requests-card-bg.svg');
}

.reactions-card {
  background-image: linear-gradient(180deg, rgba(247, 209, 76, 0.40) 0%, rgba(247, 209, 76, 0.00) 100%, rgba(2, 4, 32, 0.50)), url('/reactions-card-bg.webp');
}
</style>
