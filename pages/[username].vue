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
    <div class="flex items-start justify-start w-full h-full pb-8  mb-8">
      <UButton to="/" variant="ghost" label="back to homepage" icon="i-ph-arrow-left-thin" color="gray" class="transition-colors duration-200" />
    </div>
    <div class="grid grid-col-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-[42px]">
      <div class="card-border relative z-40 md:col-span-2 h-full md:h-[400px] lg:h-full lg:col-span-1 lg:row-span-2 bg-gray-800 p-[1px] rounded-xl">
        <div class="profile-card flex flex-col md:flex-row lg:flex-col items-center justify-between h-full z-40 !bg-gray-950 rounded-[9.5px] relative p-[18px] sm:p-[44px]">
          <div class="flex flex-col md:flex-row lg:flex-col gap-y-6 pb-2 md:w-full items-center text-center justify-between">
            <img :src="`https://avatars.githubusercontent.com/u/${contributor.githubId}`" :alt="contributor?.username" class="rounded-full" />
            <div class="flex flex-col items-center gap-5">
              <div class="flex flex-col gap-y-[18px]">
                <UButton :to="`https://github.com/${contributor.username}`" color="gray" variant="ghost" size="lg" icon="i-simple-icons-github" target="_blank" :trailing="true" class="transition-colors duration-200">
                  <div class="text-2xl">{{ contributor.username }}</div>
                </UButton>

                <div class="inline-flex items-center justify-center gap-1">
                  <svg class="h-6" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M37.3227 14.4875V14.6091C37.3227 16.0425 37.3227 16.7609 36.9777 17.3475C36.6327 17.9342 36.0044 18.2825 34.751 18.9809L33.4293 19.7142C34.3393 16.6342 34.6443 13.3241 34.756 10.4941L34.7727 10.1257L34.776 10.0391C35.861 10.4157 36.471 10.6974 36.851 11.2241C37.3227 11.8791 37.3227 12.7491 37.3227 14.4875ZM3.98877 14.4875V14.6091C3.98877 16.0425 3.98877 16.7609 4.33378 17.3475C4.67878 17.9342 5.30713 18.2825 6.56048 18.9809L7.88384 19.7142C6.97216 16.6342 6.66715 13.3241 6.55548 10.4941L6.53882 10.1257L6.53715 10.0391C5.45046 10.4157 4.84045 10.6974 4.46044 11.2241C3.98877 11.8791 3.98877 12.7508 3.98877 14.4875Z"
                      fill="#F8FAFC" />
                    <path fill-rule="evenodd" clip-rule="evenodd"
                      d="M20.6553 4.21524C23.6287 4.21524 26.077 4.47691 27.9504 4.79358C29.8488 5.11359 30.7971 5.27359 31.5905 6.25027C32.3838 7.22696 32.3405 8.28198 32.2572 10.392C31.9705 17.6405 30.4071 26.6923 21.9053 27.4923V33.3824H24.2887C24.6738 33.3827 25.047 33.5163 25.3448 33.7606C25.6426 34.0049 25.8465 34.3448 25.922 34.7225L26.2387 36.2992H30.6555C30.987 36.2992 31.3049 36.4309 31.5394 36.6653C31.7738 36.8997 31.9055 37.2176 31.9055 37.5492C31.9055 37.8807 31.7738 38.1987 31.5394 38.4331C31.3049 38.6675 30.987 38.7992 30.6555 38.7992H10.6551C10.3236 38.7992 10.0056 38.6675 9.77119 38.4331C9.53677 38.1987 9.40507 37.8807 9.40507 37.5492C9.40507 37.2176 9.53677 36.8997 9.77119 36.6653C10.0056 36.4309 10.3236 36.2992 10.6551 36.2992H15.0718L15.3885 34.7225C15.464 34.3448 15.668 34.0049 15.9657 33.7606C16.2635 33.5163 16.6367 33.3827 17.0219 33.3824H19.4053V27.4923C10.9051 26.6923 9.34174 17.6388 9.05507 10.392C8.97006 8.28198 8.9284 7.22529 9.72174 6.25027C10.5134 5.27359 11.4618 5.11359 13.3601 4.79358C15.7716 4.39837 18.2117 4.20492 20.6553 4.21524ZM22.242 11.2137L22.0786 10.9204C21.4453 9.782 21.1286 9.21533 20.6553 9.21533C20.1819 9.21533 19.8653 9.782 19.2319 10.9204L19.0686 11.2137C18.8886 11.537 18.7986 11.697 18.6586 11.8037C18.5169 11.9104 18.3419 11.9504 17.9919 12.0287L17.6752 12.102C16.4452 12.3804 15.8302 12.5187 15.6835 12.9887C15.5368 13.4604 15.9569 13.9504 16.7952 14.9304L17.0119 15.1838C17.2502 15.4621 17.3702 15.6004 17.4235 15.7738C17.4769 15.9471 17.4586 16.1321 17.4235 16.5038L17.3902 16.8421C17.2635 18.1505 17.2002 18.8055 17.5819 19.0955C17.9652 19.3855 18.5419 19.1205 19.6936 18.5905L19.9903 18.4538C20.3186 18.3038 20.4819 18.2288 20.6553 18.2288C20.8286 18.2288 20.9919 18.3038 21.3203 18.4538L21.617 18.5905C22.7686 19.1222 23.3453 19.3855 23.7287 19.0955C24.112 18.8055 24.047 18.1505 23.9203 16.8421L23.887 16.5038C23.852 16.1321 23.8337 15.9471 23.887 15.7738C23.9403 15.6021 24.0603 15.4621 24.2987 15.1838L24.5153 14.9304C25.3537 13.9504 25.7737 13.4604 25.627 12.9887C25.4804 12.5187 24.8654 12.3804 23.6353 12.102L23.3187 12.0287C22.9686 11.9504 22.7936 11.912 22.652 11.8037C22.512 11.697 22.422 11.537 22.242 11.2137Z"
                      fill="#F8FAFC" />
                  </svg>
                  <span class="text-xl text-center md:text-left lg:text-center md:ml-4 lg:ml-0"><span class="text-2xl font-medium">{{ format(contributor.score) }} {{ contributor?.score === 1 ? 'pt' : 'pts' }}</span></span>
                </div>
              </div>

              <span class="block mb-10 md:mb-0 h-[1px] w-[92px] bg-gray-800" />

              <div class="flex flex-col items-center justify-center text-center gap-y-3">
                <span class="text-lg">Share your Nuxter profile ✨</span>

                <UButton @click="copy(`nuxters.nuxt.com/${contributor.username}`)" color="gray" variant="outline" size="xl"
                  :class="{ 'border-primary-400': copied }" class="max-w-[250px] m:max-w-[270px] xl:max-w-[300px]">
                  <span class="truncate">{{ `nuxters.nuxt.com/${contributor.username}` }}</span>
                  <UIcon :name="copied ? 'i-ph-check' : 'i-ph-copy'" class="h-5 w-5 shrink-0" :class="{ 'text-green-400': copied }"/>
                </UButton>
              </div>
            </div>
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

.profile-card {
  background-image: url('/card-gradient-bg.svg') ;
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
