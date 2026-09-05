<script setup lang="ts">
import type { PeopleEntry, PeopleResults } from '#shared/people'

definePageMeta({ layout: 'explorer', colorMode: 'dark' })
useSeoMeta({
  title: 'Meet the Nuxt community · Nuxters',
  description: 'Explore Nuxt contributors around the world. Find a country, search for a Nuxter, and see their contributions.',
  ogTitle: 'A world of Nuxters',
})
useHead({ link: [{ rel: 'canonical', href: 'https://nuxters.nuxt.com/people' }] })
const { data: people, error: mapError, refresh: refreshMap } = await usePeopleMap()
const { country, query, page, searchInput, expanded, search, selectCountry, setPage } = usePeopleExplorer()
const { data: results, status, error, refresh } = await useFetch<PeopleResults>('/api/people/contributors', {
  key: 'people-directory',
  query: { country, q: query, page },
  deep: false,
  lazy: true,
})
const focusedPerson = ref<PeopleEntry | null>(null)
const focusRequest = ref(0)
watch(country, () => focusedPerson.value = null)
function selectMapCountry(value: string) {
  focusedPerson.value = null
  return selectCountry(value)
}
function locatePerson(person: PeopleEntry) {
  focusedPerson.value = person
  focusRequest.value++
  expanded.value = false
}
const selected = computed(() => people.value?.countries.find(item => item.id === country.value))
const focusedCountry = computed(() => people.value?.countries.find(item => item.id === (focusedPerson.value?.countryId || country.value)))
const countries = computed(() => [{ label: 'All countries', value: 'all' }, ...(people.value?.countries ?? []).map(item => ({ label: item.label, value: item.id, icon: countryFlag(item.id) })).sort((a, b) => a.label.localeCompare(b.label, 'en'))])
const pages = computed(() => Math.max(1, Math.ceil((results.value?.total ?? 0) / (results.value?.pageSize ?? 48))))
function countryFlag(id: string) {
  const code = id.replace(/^country-/, '').toLowerCase()
  return /^[a-z]{2}$/.test(code) ? `i-circle-flags-${code}` : 'i-lucide-globe'
}
const resultsScroll = useTemplateRef('resultsScroll')
watch(() => results.value, () => resultsScroll.value?.scrollTo({ top: 0 }), { flush: 'post' })
</script>

<template>
  <div
    class="people-explorer"
    :class="{ 'people-explorer--expanded': expanded }"
  >
    <div class="people-explorer__heading">
      <h1>People <span class="ml-1">of Nuxt</span></h1>
      <p aria-live="polite">
        <template v-if="focusedCountry">
          {{ focusedCountry.label }} · {{ focusedCountry.count.toLocaleString('en-US') }} {{ focusedCountry.count === 1 ? 'person' : 'people' }}
        </template>
        <template v-else-if="people">
          {{ people.mappedContributors.toLocaleString('en-US') }} people · {{ people.countries.length }} countries
        </template>
      </p>
    </div>

    <div class="people-explorer__map">
      <ClientOnly>
        <LazyPeopleGlobalPeopleGlobe
          v-if="people"
          mode="explore"
          :countries="people.countries"
          :selected-id="focusedPerson?.countryId || country"
          :focus-request="focusRequest"
          :focused-username="focusedPerson?.username"
          @select="selectMapCountry"
        />
        <template #fallback>
          <div
            class="people-explorer__loading"
            aria-label="Loading community globe"
          />
        </template>
      </ClientOnly>
      <div
        class="people-explorer__curtain"
        aria-hidden="true"
      />
    </div>
    <p class="people-explorer__hint">
      Drag to explore · Select a country to meet its people
    </p>

    <aside
      class="people-panel"
      aria-labelledby="people-panel-title"
    >
      <UButton
        class="people-panel__toggle"
        color="neutral"
        variant="ghost"
        :aria-expanded="expanded"
        aria-controls="people-panel-content"
        @click="expanded = !expanded"
      >
        <span class="people-panel__handle" />
        <span>{{ expanded ? 'Show more of the globe' : 'Expand contributor list' }}</span>
        <UIcon :name="expanded ? 'i-lucide-chevron-down' : 'i-lucide-chevron-up'" />
      </UButton>
      <div class="people-panel__header">
        <div class="flex items-center justify-between gap-4">
          <h2 id="people-panel-title">
            {{ selected?.label || 'Community' }}
          </h2>
          <span class="people-panel__count">{{ (results?.total ?? 0).toLocaleString('en-US') }} people</span>
        </div>
        <div class="people-panel__filters">
          <UInput
            :model-value="searchInput"
            icon="i-lucide-search"
            placeholder="Find someone"
            aria-label="Search contributors"
            size="lg"
            variant="soft"
            :ui="{ base: 'bg-elevated text-default' }"
            class="w-full"
            :maxlength="100"
            @update:model-value="search(String($event))"
          />
          <USelectMenu
            id="people-country"
            :model-value="country || 'all'"
            :items="countries"
            value-key="value"
            aria-label="Country"
            placeholder="All countries"
            :search-input="{ placeholder: 'Search countries' }"
            size="lg"
            variant="soft"
            :ui="{ base: 'bg-elevated text-default', content: 'min-w-64' }"
            class="w-full min-w-0"
            @update:model-value="selectMapCountry($event === 'all' ? '' : ($event ?? ''))"
          />
        </div>
      </div>

      <div
        id="people-panel-content"
        ref="resultsScroll"
        class="people-panel__results"
        :aria-busy="status === 'pending'"
      >
        <div
          v-if="mapError || error"
          class="people-panel__empty"
          role="alert"
        >
          <UIcon name="i-lucide-wifi-off" />
          <p>We couldn't load the community.</p>
          <UButton
            label="Try again"
            variant="outline"
            @click="() => { refreshMap(); refresh() }"
          />
        </div>
        <div
          v-else-if="status === 'pending'"
          class="people-panel__empty"
          role="status"
        >
          <UIcon
            name="i-lucide-loader-circle"
            class="animate-spin motion-reduce:animate-none"
          />
          <p>Finding Nuxters…</p>
        </div>
        <div
          v-else-if="!results?.total"
          class="people-panel__empty"
          role="status"
        >
          <UIcon name="i-lucide-search" />
          <p>No contributors match your search.</p>
          <UButton
            label="Clear filters"
            variant="outline"
            @click="selectCountry('')"
          />
        </div>
        <ul
          v-else
          class="people-panel__list"
          aria-label="Contributors"
        >
          <li
            v-for="person in results.items"
            :key="person.username"
            :class="{ 'is-located': focusedPerson?.username === person.username }"
          >
            <button
              type="button"
              class="people-panel__locate"
              :aria-label="`Locate ${person.username} in ${person.country}`"
              :aria-pressed="focusedPerson?.username === person.username"
              @click="locatePerson(person)"
            />
            <div class="people-panel__person">
              <NuxtImg
                :src="person.username"
                width="40"
                height="40"
                alt=""
                loading="lazy"
                class="people-panel__avatar"
              />
              <span class="people-panel__identity">
                <NuxtLink
                  :to="`/${person.username}`"
                  :aria-label="`Open ${person.username}'s profile`"
                  class="people-panel__username"
                >{{ person.username }}</NuxtLink>
                <span
                  v-if="!selected"
                  class="people-panel__country"
                >
                  <UIcon
                    :name="countryFlag(person.countryId)"
                    aria-hidden="true"
                    class="people-panel__flag"
                  />
                  {{ person.country }}
                </span>
              </span>
            </div>
          </li>
        </ul>
      </div>

      <footer class="people-panel__footer">
        <nav
          class="people-panel__pagination"
          aria-label="Contributor pages"
        >
          <UButton
            icon="i-lucide-arrow-left"
            aria-label="Previous page"
            variant="ghost"
            color="neutral"
            :disabled="status === 'pending' || (results?.page ?? 1) <= 1"
            @click="setPage((results?.page ?? 1) - 1)"
          />
          <span aria-live="polite">Page {{ results?.page ?? 1 }} of {{ pages.toLocaleString('en-US') }}</span>
          <UButton
            icon="i-lucide-arrow-right"
            aria-label="Next page"
            variant="ghost"
            color="neutral"
            :disabled="status === 'pending' || (results?.page ?? 1) >= pages"
            @click="setPage((results?.page ?? 1) + 1)"
          />
        </nav>
        <UCollapsible class="people-panel__about">
          <UButton
            icon="i-lucide-info"
            label="About these locations"
            variant="ghost"
            color="neutral"
            size="xs"
            class="px-0 text-muted"
          />
          <template #content>
            <p>
              Public GitHub locations, grouped by country. Avatars are a sample; positions are approximate.
              <ULink
                to="https://www.geonames.org/"
                target="_blank"
                rel="noopener noreferrer"
              >GeoNames</ULink>.
            </p>
          </template>
        </UCollapsible>
      </footer>
    </aside>
  </div>
</template>

<style scoped>
.people-explorer { --people-sidebar-width: clamp(560px, 42vw, 800px); position: relative; height: 100%; overflow: hidden; background: var(--color-neutral-950); color: #dbe5ed; }
.people-explorer__heading { position: absolute; z-index: 2; top: 32px; left: max(32px, calc((100vw - var(--ui-container)) / 2 + 32px)); pointer-events: none; }
.people-explorer h1 { margin: 0; color: white; font-size: clamp(30px, 3vw, 40px); line-height: 1.1; font-weight: 550; letter-spacing: -.045em; }
.people-explorer h1 span { color: var(--ui-primary); }
.people-explorer__heading > p:last-child { margin-top: 12px; color: var(--ui-text-muted); font-size: 14px; }
.people-explorer__map { position: absolute; inset: 0 var(--people-sidebar-width) 0 0; }
.people-explorer__map::after { content: ""; position: absolute; inset: 0 0 auto; height: 230px; background: linear-gradient(var(--color-neutral-950) 10%, color-mix(in srgb, var(--color-neutral-950) 85%, transparent) 45%, transparent); pointer-events: none; }
.people-explorer__loading { position: absolute; inset: 15%; border-radius: 50%; background: radial-gradient(circle, #0d2620, transparent 68%); }
.people-explorer__curtain { position: absolute; inset: 0 0 0 auto; width: 100px; background: linear-gradient(to right, transparent, var(--color-neutral-950)); pointer-events: none; }
.people-explorer__hint { position: absolute; left: 260px; bottom: 43px; color: #61766f; font-size: 11px; pointer-events: none; }
.people-panel { position: absolute; z-index: 3; width: var(--people-sidebar-width); inset: 0 0 0 auto; display: flex; flex-direction: column;  background: var(--color-neutral-950); overflow: hidden; }
.people-panel__header { padding: 20px 16px 14px;  }
.people-panel h2 { font-size: 19px; font-weight: 550; color: #f1f6f9; letter-spacing: -.025em; }
.people-panel__count { color: var(--ui-text-muted); font-size: 11px; font-variant-numeric: tabular-nums; }
.people-panel__filters { display: grid; grid-template-columns: minmax(0, 1fr) 160px; gap: 8px; margin-top: 12px; }
.people-panel__header p { margin-top: 6px; color: #7f8c9d; font-size: 12px; }
.people-panel__results { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; scrollbar-color: #34453f transparent; }
.people-panel__list > li { position: relative; min-width: 0; }
.people-panel__locate { position: absolute; inset: 0; width: 100%; height: 100%; }
.people-panel__locate:hover, .people-panel__list > li.is-located { background: color-mix(in srgb, var(--ui-primary) 6%, transparent); }
.people-panel__locate:focus-visible { outline: 2px solid var(--ui-primary); outline-offset: -2px; }
.people-panel__list { display: grid; grid-template-columns: repeat(auto-fit, minmax(175px, 1fr)); gap: 0; padding: 4px 8px; }
.people-panel__person { display: flex; width: 100%; text-align: left; align-items: center; gap: 8px; min-height: 44px; padding: 5px 8px; pointer-events: none; border-radius: 0; transition: background 120ms ease; }
.people-panel__avatar { width: 28px; height: 28px; border-radius: 50%; background: #19212c; flex-shrink: 0; }
.people-panel__identity { min-width: 0; flex: 1; }
.people-panel__username { position: relative; pointer-events: auto; width: fit-content; max-width: 100%; white-space: nowrap; display: block; overflow: hidden; text-overflow: ellipsis; color: var(--ui-text-highlighted); font-size: 13px; font-weight: 500; }
.people-panel__username:hover { color: var(--ui-primary); }
.people-panel__flag { width: 12px; height: 12px; flex-shrink: 0; }
.people-panel__country { display: flex; align-items: center; gap: 5px; margin-top: 1px; color: var(--ui-text-muted); font-size: 10px; }
.people-panel__about { margin-top: 0; font-size: 10px; color: #78899a; }
.people-panel__footer {  padding: 4px 16px 8px; }
.people-panel__pagination { display: flex; align-items: center; justify-content: space-between; color: #9ba8b8; font-size: 11px; font-variant-numeric: tabular-nums; }
.people-panel__pagination :deep(button) { width: 40px; height: 40px; justify-content: center; }
.people-panel__footer p { margin-top: 8px; color: #78899a; font-size: 10px; line-height: 1.6; }
.people-panel__footer a { text-decoration: underline; text-underline-offset: 2px; }
.people-panel__empty { display: grid; place-content: center; justify-items: center; gap: 12px; height: 100%; min-height: 140px; color: #91a2b3; text-align: center; font-size: 13px; padding: 24px; }
.people-panel__toggle { display: none; }
@media (min-width: 1024px) and (max-width: 1199px) { .people-explorer { --people-sidebar-width: 420px; } }
@media (max-width: 1023px) and (min-width: 768px) { .people-panel { width: 360px; } .people-explorer__map { right: 360px; } .people-explorer__heading { left: 24px; } .people-explorer__hint { display: none; } }
@media (max-width: 767px) {
  .people-explorer__heading { top: 20px; left: 16px; }
  .people-explorer h1 { font-size: 30px; }
  .people-explorer__heading > p:last-child { font-size: 13px; margin-top: 8px; }
  .people-explorer__map { inset: 0 0 25%; }
  .people-explorer__map :deep(.people-globe__controls) { top: 90px; left: 12px; flex-direction: column; }
  .people-explorer__map :deep(.people-globe__controls button) { width: 36px; height: 36px; }
  .people-explorer__curtain { inset: auto 0 0; width: 100%; height: 100px; background: linear-gradient(transparent, var(--color-neutral-950)); }
  .people-explorer__hint { display: none; }
  .people-panel { inset: auto 0 0; width: 100%; height: 43%; border-radius: 0; border-left: 0;  background: var(--color-neutral-950); }
  .people-explorer--expanded .people-panel { height: 80%; }
  .people-panel__toggle { display: flex; flex-shrink: 0; align-items: center; justify-content: center; gap: 6px; width: 100%; height: 38px; padding-top: 9px; color: #9eacb9; font-size: 10px; position: relative; }
  .people-panel__handle { position: absolute; top: 7px; left: calc(50% - 16px); width: 32px; height: 3px; border-radius: 4px; background: #53616d; }
  .people-panel__header { padding: 6px 16px 12px; }
  .people-panel h2 { font-size: 17px; }
  .people-panel__header p { display: none; }
  .people-panel__filters { margin-top: 10px; }
  .people-panel__footer { padding: 4px 16px max(8px, env(safe-area-inset-bottom)); }
  .people-panel__about { display: none; }
  .people-explorer--expanded .people-panel__about { display: block; }
  .people-panel__person { padding: 5px 8px; }
  .people-panel__username { position: relative; pointer-events: auto; width: fit-content; max-width: 100%; font-size: 12px; }
  .people-panel__list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .people-panel { transition: height 220ms cubic-bezier(.2,.8,.2,1); }
}
@media (prefers-reduced-motion: reduce) { .people-panel { transition: none; } }
</style>
