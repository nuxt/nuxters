<script lang="ts" setup>
import { GithubUser } from "~~/types"

defineProps<{ nuxter: GithubUser }>()

defineOptions({
  inheritAttrs: false
})
</script>
<template>
<div class="bg-black flex-col text-white py-10 text-center w-full justify-center items-center flex">
  <div class="spotlight" />
  <div  class="card">
    <div class="flex items-center justify-center gap-3 mb-12">
      <div class="flex flex-row items-center gap-2 text-5xl">
        <div>{{ nuxter.login }} is a star</div>
        <svg viewBox='0 0 24 24' width='1em' height='1em' class="ml-3 text-yellow-500" xmlns='http://www.w3.org/2000/svg' ><path fill='currentColor' d='m12 18.26l-7.053 3.948l1.575-7.928L.588 8.792l8.027-.952L12 .5l3.385 7.34l8.027.952l-5.934 5.488l1.575 7.928L12 18.26Z'/></svg>
      </div>
    </div>
    <div class="flex flex-row items-center gap-5 justify-center mb-5">
      <div class="mr-5">
        <img :src="nuxter.avatar_url" :alt="nuxter.login" width="120" height="120" class="w-120px h-120px rounded-full" />
      </div>
      <div>
        <div class="text-8xl font-bold flex items-center mb-2">{{ nuxter.contributions }}</div>
        <span class="italic text-gray-300 text-2xl">Contributions to nuxt/nuxt</span>
      </div>
    </div>
  </div>
  <div class="mt-12">
    <img width="200" class="opacity-40" src="/nuxt.svg" />
  </div>
</div>
</template>
<style scoped>
.spotlight {
  position: absolute;
  top: -30%;
  right: -30%;
  pointer-events: none;
  opacity: 0.5;
  background-image: linear-gradient(to right, #68d391, #4fd1c5, #6366f1);
  border-radius: 9999px;
  height: 630px;
  width: 1200px;
  filter: blur(150px);
}
.card {
  background-image: linear-gradient(to right, rgba(24,24,27,1), rgba(24,24,27,0.4));
  backdrop-filter: blur(4px);
  border: 2px solid #2d3748;
  padding: 50px 75px;
  max-width: 800px;
  border-radius: 8px;
  width: 100%;
}
</style>
