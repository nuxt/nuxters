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
</script>

<template>
  <div class="pb-[60px] lg:min-h-[calc(100dvh-9rem)] flex flex-col items-center justify-center">
    <div class="flex items-start justify-start w-full h-full my-8">
      <UButton to="/" variant="ghost" label="back to homepage" icon="i-ph-arrow-left-thin" color="gray"
        class="transition-colors duration-200" />
    </div>
    <UPageGrid :ui="{ wrapper: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full' }">
      <div
        class="card-border relative z-40 md:col-span-2 h-full md:h-[400px] lg:h-full lg:col-span-1 lg:row-span-2 bg-gray-800 p-[1px] rounded-xl">
        <div
          class="profile-card flex flex-col md:flex-row lg:flex-col items-center justify-between h-full z-40 !bg-gray-950 rounded-[9.5px] relative p-[18px] sm:p-[44px]">
          <div class="flex flex-col md:flex-row lg:flex-col gap-y-6 pb-2 lg:w-full items-center text-center">
            <img :src="`https://avatars.githubusercontent.com/u/${contributor.githubId}`" :alt="contributor?.username"
              class="rounded-full" />
            <div class="flex flex-col gap-y-[18px] md:ml-6 lg:ml-0">
              <UButton :to="`https://github.com/${contributor.username}`" color="gray" variant="ghost" size="lg"
                icon="i-simple-icons-github" target="_blank" :trailing="true" class="transition-colors duration-200">
                <div class="text-2xl">{{ contributor.username }}</div>
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

            <UButton @click="copy(`nuxters.nuxt.com/${contributor.username}`)" color="gray" variant="outline" size="xl"
              :class="{ 'border-primary-400': copied }" class="max-w-[250px] m:max-w-[270px] xl:max-w-[300px]">
              <span class="truncate">{{ `nuxters.nuxt.com/${contributor.username}` }}</span>
              <UIcon :name="copied ? 'i-ph-check' : 'i-ph-copy'" class="h-5 w-5 shrink-0"
                :class="{ 'text-green-400': copied }" />
            </UButton>
          </div>
        </div>
      </div>

      <div class="border-primary-400 issues-card card">
        <span class="text-5xl font-medium">{{ format(contributor.issues) }}</span>
        <span class="text-2xl">{{ contributor?.issues === 1 ? 'Issue' : 'Issues' }}</span>
      </div>
      <div class="border-blue-400 comments-card card">
        <span class="text-5xl font-medium">{{ format(contributor.comments) }}</span>
        <span class="text-2xl">{{ contributor?.comments === 1 ? 'Comment' : 'Comments' }}</span>
      </div>
      <div class="border-violet-400 pull-requests-card card">
        <span class="text-5xl font-medium">{{ format(contributor.merged_pull_requests) }}</span>
        <span class="text-2xl">Merged {{ contributor?.merged_pull_requests === 1 ? 'PR' : 'PRs' }}</span>
      </div>
      <div class="border-yellow-400 reactions-card card">
        <span class="text-5xl font-medium">{{ format(contributor.reactions) }}</span>
        <span class="text-2xl">{{ contributor?.reactions === 1 ? 'Reaction' : 'Reactions' }}</span>
      </div>
    </UPageGrid>
  </div>
</template>

<style scoped lang="postcss">
.card-border::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  background-image: linear-gradient(to bottom right, #00dc82, #1e293b);
  z-index: -1;
}

.profile-card {
  background-image: url('/card-gradient-bg.svg');
  background-repeat: no-repeat;
  background-size: 300%;
}

.card {
  @apply rounded-xl border h-[285px] bg-no-repeat bg-top p-6 text-center flex flex-col items-center justify-end;
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
