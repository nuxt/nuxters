<script setup lang="ts">
defineProps({
  text: {
    type: String,
    default: '',
  },
})
const { copy, copied } = useClipboard()
</script>

<template>
  <UButton
    :label="text"
    size="xl"
    class="grid grid-cols-12 sm:grid-cols-6 items-center justify-between gap-x-3 px-5 transition-all duration-200 group border w-fit"
    :class="[
      [copied ? 'border-primary-600' : 'border-gray-700 hover:border-gray-500'],
    ]"
    @click="copy(text)"
  >
    <span class="font-mono text-gray-300 col-span-11 sm:col-span-4 text-center">{{ text }}</span>
    <UIcon
      :name="copied ? 'i-ph-check' : 'i-ph-copy'"
      class="w-5 h-5 col-span-1 justify-self-end"
      :class="[copied ? 'text-primary-400' : 'text-gray-300 opacity-50']"
    />
  </UButton>
</template>
