<script setup lang="ts">
const url = useRequestURL().origin
const { data: allContributors, status } = useLazyFetch('/contributors.json', { baseURL: url, server: false })
const limit = useState('contributors-limit', () => 100)

const showMore = () => {
  limit.value += 100
}

const contributors = computed(() => {
  return allContributors.value?.slice(0, limit.value) || []
})
</script>

<template>
  <div class="text-white">
    <h2 class="text-3xl lg:text-4xl font-bold mb-12">
      They are already <span class="text-green-400">Nuxters</span>
    </h2>

    <div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-4 sm:gap-5 lg:gap-8">
      <template v-if="status !== 'success'">
        <div
          v-for="i in 100"
          :key="i"
          class="pt-[100%] relative"
        >
          <div class="absolute inset-0 bg-neutral-900 rounded-xl animate-pulse" />
        </div>
      </template>
      <div
        v-for="(contributor, index) in contributors"
        :key="index"
        class="pt-[100%] relative"
      >
        <NuxtLink
          v-if="contributor.username"
          :key="contributor.username"
          :to="`/${contributor.username}`"
          class="absolute inset-0 flex transition-all"
          :style="{
            'transition-delay': `${(index % 8 + Math.floor(index / 8)) * 20}ms`,
          }"
        >
          <UTooltip
            class="w-full"
            :text="contributor.username"
          >
            <NuxtImg
              :src="contributor.username"
              densities="x1 x2"
              height="80px"
              width="80px"
              :alt="contributor.username"
              loading="lazy"
              class="rounded-xl w-full h-full transition lg:hover:scale-110"
            />
          </UTooltip>
          <span class="inline-block rounded-t px-1 bg-neutral-950 absolute -bottom-2 right-0 font-medium text-sm"><span class="font-light text-xs text-neutral-400">#</span>{{ index + 1 }}</span>
        </NuxtLink>
      </div>
    </div>
    <div>
      <div class="pt-8 flex justify-center">
        <UButton
          variant="outline"
          color="neutral"
          class="rounded-full"
          size="xl"
          icon="i-ph-plus-bold"
          @click="showMore"
        >
          Show more
        </UButton>
      </div>
    </div>
  </div>
</template>
