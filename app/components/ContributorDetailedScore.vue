<script setup lang="ts">
import type { Contributor } from '#shared/types'

const props = defineProps<{
  contributor: Contributor
}>()

const format = useNumberFormatter()

interface ScoreRow {
  emoji: string
  label: string
  multiplier: number
  amount: number
  total: number
}

const rows = computed<ScoreRow[]>(() => {
  const prs = props.contributor.merged_pull_requests
  return [
    { emoji: '🚀', label: 'Feature PRs', multiplier: 7, amount: prs.feat, total: prs.feat * 7 },
    { emoji: '🔧', label: 'Fix PRs', multiplier: 5, amount: prs.fix, total: prs.fix * 5 },
    { emoji: '📝', label: 'Docs PRs', multiplier: 4, amount: prs.docs, total: prs.docs * 4 },
    { emoji: '🧹', label: 'Chore PRs', multiplier: 3, amount: prs.chore, total: prs.chore * 3 },
    { emoji: '💡', label: 'Helpful issues', multiplier: 3, amount: props.contributor.helpful_issues, total: props.contributor.helpful_issues * 3 },
    { emoji: '💬', label: 'Helpful comments', multiplier: 2, amount: props.contributor.helpful_comments, total: props.contributor.helpful_comments * 2 },
    { emoji: '🐛', label: 'Issues', multiplier: 1, amount: props.contributor.issues, total: props.contributor.issues },
    { emoji: '🗨️', label: 'Comments', multiplier: 0.5, amount: props.contributor.comments, total: props.contributor.comments * 0.5 },
    { emoji: '⭐', label: 'Reactions', multiplier: 0.1, amount: props.contributor.reactions, total: props.contributor.reactions * 0.1 },
  ]
})

const sortedRows = computed(() => [...rows.value].sort((a, b) => b.total - a.total))
const maxTotal = computed(() => sortedRows.value[0]?.total ?? 0)

const animated = ref(false)
function onOpenModal() {
  animated.value = false
  nextTick(() => {
    requestAnimationFrame(() => {
      animated.value = true
    })
  })
}
</script>

<template>
  <UModal
    title="How is the score calculated?"
    :ui="{ body: 'p-0 sm:p-0' }"
    @update:open="$event && onOpenModal()"
  >
    <UButton
      variant="ghost"
      icon="i-ph-info"
      color="neutral"
      size="xs"
      class="ml-1"
      aria-label="show score breakdown"
    />
    <template #body>
      <div class="p-5 sm:p-6">
        <div class="flex flex-col items-center gap-1 py-4 bg-border rounded">
          <span class="text-4xl font-bold tabular-nums">{{ format(contributor.score) }}</span>
          <span class="text-sm text-muted">total points</span>
        </div>

        <div class="flex flex-col gap-3 pt-5">
          <div
            v-for="row in sortedRows"
            :key="row.label"
            class="flex flex-col gap-1.5"
          >
            <div class="flex items-center justify-between text-sm">
              <span>{{ row.emoji }} {{ row.label }}</span>
              <span class="tabular-nums text-muted">
                {{ format(row.amount) }} × {{ row.multiplier }}
                = <span class="font-medium text-default">{{ format(row.total) }}</span>
              </span>
            </div>
            <div class="h-1.5 rounded-full bg-elevated overflow-hidden">
              <div
                class="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                :style="{ width: animated && maxTotal ? `${(row.total / maxTotal) * 100}%` : '0%', transitionDelay: `${sortedRows.indexOf(row) * 75}ms` }"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
