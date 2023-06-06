<script lang="ts" setup>
import { GithubUser } from '~~/types'

const { username } = useRoute().params

const contributor = useState<GithubUser>()

if (process.server) {
  const nuxter = await $fetch('/api/contributor', { query: { username } })
  if (nuxter.statusCode === 404) {
    throw createError({ statusCode: 404, statusMessage: 'Nuxter Not Found' })
  }
  contributor.value = nuxter

  defineOgImageDynamic({
    component: 'NuxterOgImage',
    nuxter,
  })
}
</script>
<template>
  <div class="text-center">
    <div class="flex items-center gap-5 justify-center mb-7">
      <img
        :src="contributor.avatar_url"
        :alt="contributor.login"
        width="60"
        height="60"
        class="w-60px h-60px rounded-full"
      />
      <div class="flex items-center gap-5">
        <div class="text-7xl font-bold flex items-center">{{ contributor.contributions }}</div>
        <span class="italic text-gray-400 text-xs"
          >Contributions to the <br />
          <a href="" class="underline">nuxt/nuxt</a> repo.</span
        >
      </div>
    </div>
    <div class="flex items-center justify-center gap-3 mb-7">
      <div class="flex items-center gap-2 text-xl">
        <strong>{{ contributor.login }}</strong> is a Nuxt star
        <div class="i-ri-star-fill w-6 h-6 text-yellow" />
      </div>
    </div>
    <div>
      Visit their
      <a :href="`https://github.com/${contributor.login}`" class="inline-flex items-center justify-center"
        >GitHub
        <div class="i-ri-github-fill w-4 h-4 ml-2"></div
      ></a>
    </div>
  </div>
</template>
