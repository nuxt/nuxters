
<script setup lang="ts">
defineProps({
  text: {
    type: String,
    default: ''
  }
})
const { copy, copied } = useClipboard()
</script>


<template>
  <UButton @click='copy(text)'
    :label="text"
    size="xl"
    class="grid grid-cols-12 sm:grid-cols-6 items-center justify-between gap-x-3 px-5 transition-all duration-200 group border w-fit"
    :class="[
      [copied ? 'border-primary-600' : 'border-neutral-700 hover:border-neutral-500']
    ]"
    >
    <span class="font-mono text-neutral-300 col-span-11 sm:col-span-4 text-center">{{ text }}</span>
    <UIcon :name="copied ? 'i-ph-check' : 'i-ph-copy'" class="w-5 h-5 col-span-1 justify-self-end" :class="[copied ? 'text-primary-400' : 'text-neutral-300 opacity-50']"/>
  </UButton>
</template>
