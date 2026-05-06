<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Contributor, Score } from '#shared/types'

const props = defineProps<{
  contributor: Contributor
}>()

const format = useNumberFormatter()

const detailedScore = computed<Score[]>(() => {
  const prs = props.contributor.merged_pull_requests
  return [
    { type: 'Feature PRs', multiplier: 7, amount: format(prs.feat), total: format(prs.feat * 7) },
    { type: 'Fix PRs', multiplier: 5, amount: format(prs.fix), total: format(prs.fix * 5) },
    { type: 'Docs PRs', multiplier: 4, amount: format(prs.docs), total: format(prs.docs * 4) },
    { type: 'Chore PRs', multiplier: 3, amount: format(prs.chore), total: format(prs.chore * 3) },
    { type: 'Helpful issues', multiplier: 3, amount: format(props.contributor.helpful_issues), total: format(props.contributor.helpful_issues * 3) },
    { type: 'Helpful comments', multiplier: 2, amount: format(props.contributor.helpful_comments), total: format(props.contributor.helpful_comments * 2) },
    { type: 'Issues', multiplier: 1, amount: format(props.contributor.issues), total: format(props.contributor.issues) },
    { type: 'Comments', multiplier: 0.5, amount: format(props.contributor.comments), total: format(props.contributor.comments * 0.5) },
    { type: 'Reactions', multiplier: 0.1, amount: format(props.contributor.reactions), total: format(props.contributor.reactions * 0.1) },
    { type: 'Score', multiplier: '', amount: '', total: format(props.contributor.score) },
  ]
})

const columns: TableColumn<Score>[] = [
  { accessorKey: 'type', header: 'Type' },
  { accessorKey: 'multiplier', header: 'Multiplier' },
  { accessorKey: 'amount', header: 'Amount' },
  { accessorKey: 'total', header: 'Total' },
]
</script>

<template>
  <UModal
    title="How is the score calculated?"
    :ui="{ body: 'p-0 sm:p-0' }"
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
      <UTable
        class="overflow-x-auto"
        :data="detailedScore"
        :columns="columns"
      />
    </template>
  </UModal>
</template>
