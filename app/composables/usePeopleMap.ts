import type { PeopleSummary } from '#shared/people'

function fetchPeopleMap(_nuxtApp: unknown, { signal }: { signal: AbortSignal }) {
  return $fetch<PeopleSummary>('/api/people', { signal })
}

export function usePeopleMap() {
  return useAsyncData('people-map', fetchPeopleMap, { deep: false, dedupe: 'defer' })
}
