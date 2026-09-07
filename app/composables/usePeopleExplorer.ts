export function usePeopleExplorer() {
  const route = useRoute()
  const router = useRouter()
  const country = computed(() => typeof route.query.country === 'string' ? route.query.country : '')
  const query = computed(() => typeof route.query.q === 'string' ? route.query.q.slice(0, 100) : '')
  const page = computed(() => {
    const value = Number(route.query.page)
    return Number.isSafeInteger(value) && value > 0 ? value : 1
  })
  const searchInput = useState('people:search-input', () => query.value)
  const expanded = useState('people:panel-expanded', () => false)
  watch(query, value => searchInput.value = value, { immediate: true })

  function navigate(next: { country?: string, q?: string, page?: number }, replace = false) {
    const filters = { country: country.value, q: query.value, page: page.value, ...next }
    const target = {
      path: '/people',
      query: {
        ...(filters.country ? { country: filters.country } : {}),
        ...(filters.q ? { q: filters.q } : {}),
        ...(filters.page > 1 ? { page: String(filters.page) } : {}),
      },
    }
    return replace ? router.replace(target) : router.push(target)
  }
  // Cancel a pending keystroke update when navigating away or choosing a country.
  let searchTimer: ReturnType<typeof setTimeout> | undefined
  watch(() => route.fullPath, () => clearTimeout(searchTimer))
  function search(value: string) {
    searchInput.value = value
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => void navigate({ q: value.trim().slice(0, 100), page: 1 }, true), 200)
  }
  function selectCountry(value: string) {
    clearTimeout(searchTimer)
    searchInput.value = ''
    return navigate({ country: value, q: '', page: 1 })
  }
  onScopeDispose(() => clearTimeout(searchTimer))
  return { country, query, page, searchInput, expanded, search, selectCountry, setPage: (value: number) => navigate({ page: value }) }
}
