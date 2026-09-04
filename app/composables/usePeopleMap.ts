import type { PeopleMapResponse } from '~/data/people'
import { peopleMapFallback } from '~/data/people'

interface UsePeopleMapOptions {
  lazy?: boolean
  server?: boolean
}

function defaultPeopleMap(): PeopleMapResponse {
  return peopleMapFallback
}

function fetchPeopleMap(_nuxtApp: unknown, { signal }: { signal: AbortSignal }): Promise<PeopleMapResponse> {
  return $fetch('/api/people', { signal })
}

export function usePeopleMap(options: UsePeopleMapOptions = {}) {
  return useAsyncData<PeopleMapResponse>('people-map', fetchPeopleMap, {
    deep: false,
    default: defaultPeopleMap,
    lazy: options.lazy ?? false,
    server: options.server ?? true,
  })
}
