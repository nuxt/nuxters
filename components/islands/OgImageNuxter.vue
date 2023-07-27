<script lang="ts" setup>
import type { Contributor } from '~/types'

defineProps<{ contributor: Contributor }>()

defineOptions({
  inheritAttrs: false,
})
const { format } = Intl.NumberFormat('en-GB', { })
</script>

<template>
  <div class="grid grid-col-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-[42px]">
    <div class="card-border relative md:col-span-2 h-full md:h-[400px] lg:h-full lg:col-span-1 lg:row-span-2 bg-gray-800 p-[1px] rounded-xl">
      <div class="profile-card flex flex-col md:flex-row lg:flex-col items-center justify-between h-full z-40 !bg-gray-950 rounded-[9.5px] relative p-[18px] sm:p-[44px]">
        <div class="flex flex-col md:flex-row lg:flex-col gap-y-6 pb-2 lg:w-full items-center text-center">
          <UAvatar :src="`https://avatars.githubusercontent.com/u/${contributor.githubId}`" size="4xl" :ui="{ background: '' }" />
          <div class="flex flex-col gap-y-[18px] md:ml-6 lg:ml-0">
            <UButton :to="`https://github.com/${contributor.username}`" color="gray" variant="ghost" size="lg" icon="i-simple-icons-github" target="_blank" :trailing="true" class="transition-colors duration-200">
              <div class="text-2xl">{{ contributor.username }}</div>
            </UButton>
            <span class="text-xl text-center md:text-left lg:text-center md:ml-4 lg:ml-0">Score: <span class="text-2xl font-medium">{{ contributor.score }} pts</span></span>
          </div>
          <span class="block md:hidden lg:block mb-12 lg:mb-0 h-[1px] w-[92px] bg-gray-800" />
        </div>
      </div>

    </div>
    <div class="border-primary-400 issues-card card">
      <span class="text-5xl font-medium">{{ format(contributor.issues + contributor.helpful_issues) }}</span>
      <span class="text-2xl">Issues</span>
    </div>
    <div class="border-blue-400 comments-card card">
      <span class="text-5xl font-medium">{{ format(contributor.comments + contributor.helpful_comments) }}</span>
      <span class="text-2xl">Comments</span>
    </div>
    <div class="border-violet-400 pull-requests-card card">
      <span class="text-5xl font-medium">{{ format(contributor.merged_pull_requests) }}</span>
      <span class="text-2xl"> Pull requests</span>
    </div>
    <div class="border-yellow-400 reactions-card card">
      <span class="text-5xl font-medium">{{ format(contributor.reactions) }}</span>
      <span class="text-2xl"> Reactions</span>
    </div>
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

.card-border {
  z-index: 50;
}

.profile-card {
  background-image: url('http://localhost:3000/card-gradient-bg.svg') ;
  background-repeat: no-repeat;
  background-size: 300%;
}

.card {
  @apply rounded-xl border h-[285px] bg-no-repeat bg-top p-6 text-center flex flex-col items-center justify-end;
}

.issues-card {
  background-image: linear-gradient(180deg, rgba(0, 220, 130, 0.40) 0%, rgba(0, 220, 130, 0.00) 100%, rgba(2, 4, 32, 0.50)), url('http://localhost:3000/issues-card-bg.svg');
}

.comments-card {
  background-image: linear-gradient(180deg, rgba(64, 187, 255, 0.40) 0%, rgba(64, 187, 255, 0.00) 100%, rgba(2, 4, 32, 0.50)), url('http://localhost:3000/comments-card-bg.svg');
}

.pull-requests-card {
  background-image: linear-gradient(180deg, rgba(139, 92, 246, 0.40) 0%, rgba(139, 92, 246, 0.00) 100%, rgba(2, 4, 32, 0.50)), url('http://localhost:3000/pull-requests-card-bg.svg');
}

.reactions-card {
  background-image: linear-gradient(180deg, rgba(247, 209, 76, 0.40) 0%, rgba(247, 209, 76, 0.00) 100%, rgba(2, 4, 32, 0.50)), url('http://localhost:3000/reactions-card-bg.webp');
}
</style>
