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
function locatePerson(person: PeopleEntry) {
  focusedPerson.value = person
  focusRequest.value++
  expanded.value = false
}
const selected = computed(() => people.value?.countries.find(item => item.id === country.value))
const countries = computed(() => [{ label: 'All countries', value: '' }, ...(people.value?.countries ?? []).map(item => ({ label: item.label, value: item.id })).sort((a, b) => a.label.localeCompare(b.label, 'en'))])
const pages = computed(() => Math.max(1, Math.ceil((results.value?.total ?? 0) / (results.value?.pageSize ?? 24))))
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
        <template v-if="focusedPerson">
          {{ focusedPerson.username }} · {{ focusedPerson.country }}
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
          @select="selectCountry"
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
      <button
        class="people-panel__toggle"
        type="button"
        :aria-expanded="expanded"
        aria-controls="people-panel-content"
        @click="expanded = !expanded"
      >
        <span class="people-panel__handle" />
        <span>{{ expanded ? 'Show more of the globe' : 'Expand contributor list' }}</span>
        <UIcon :name="expanded ? 'i-lucide-chevron-down' : 'i-lucide-chevron-up'" />
      </button>
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
            class="w-full"
            :maxlength="100"
            @update:model-value="search(String($event))"
          />
          <label
            class="sr-only"
            for="people-country"
          >Country</label>
          <select
            id="people-country"
            class="people-panel__select"
            :value="country"
            @change="selectCountry(($event.target as HTMLSelectElement).value)"
          >
            <option
              v-for="option in countries"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
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
          >
            <button
              type="button"
              class="people-panel__person"
              :class="{ 'is-located': focusedPerson?.username === person.username }"
              :aria-label="`Locate ${person.username} in ${person.country}`"
              :aria-pressed="focusedPerson?.username === person.username"
              @click="locatePerson(person)"
            >
              <NuxtImg
                :src="person.username"
                width="40"
                height="40"
                alt=""
                loading="lazy"
                class="people-panel__avatar"
              />
              <span class="people-panel__identity"><span class="people-panel__username">{{ person.username }}</span><span
                v-if="!selected"
                class="people-panel__country"
              >{{ person.country }}</span></span>
            </button>
            <NuxtLink
              :to="`/${person.username}`"
              :aria-label="`Open ${person.username}'s profile`"
              class="people-panel__profile"
            >
              <UIcon name="i-lucide-arrow-up-right" />
            </NuxtLink>
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
        <details class="people-panel__about">
          <summary>About these locations</summary>
          <p>
            Public GitHub locations, grouped by country. Avatars are a sample; positions are approximate. <a
              href="https://www.geonames.org/"
              target="_blank"
              rel="noopener noreferrer"
            >GeoNames</a>.
          </p>
        </details>
      </footer>
    </aside>
  </div>
</template>

<style scoped>
.people-explorer { position: relative; height: 100%; overflow: hidden; background: var(--color-neutral-950); color: #dbe5ed; }
.people-explorer__heading { position: absolute; z-index: 2; top: 32px; left: max(32px, calc((100vw - var(--ui-container)) / 2 + 32px)); pointer-events: none; }
.people-explorer h1 { margin: 0; color: white; font-size: clamp(30px, 3vw, 40px); line-height: 1.1; font-weight: 550; letter-spacing: -.045em; }
.people-explorer h1 span { color: var(--ui-primary); }
.people-explorer__heading > p:last-child { margin-top: 12px; color: #8d9caa; font-size: 14px; }
.people-explorer__map { position: absolute; inset: 0 420px 0 0; }
.people-explorer__map::after { content: ""; position: absolute; inset: 0 0 auto; height: 230px; background: linear-gradient(var(--color-neutral-950) 10%, color-mix(in srgb, var(--color-neutral-950) 85%, transparent) 45%, transparent); pointer-events: none; }
.people-explorer__loading { position: absolute; inset: 15%; border-radius: 50%; background: radial-gradient(circle, #0d2620, transparent 68%); }
.people-explorer__curtain { position: absolute; inset: 0 0 0 auto; width: 100px; background: linear-gradient(to right, transparent, var(--color-neutral-950)); pointer-events: none; }
.people-explorer__hint { position: absolute; left: 260px; bottom: 43px; color: #61766f; font-size: 11px; pointer-events: none; }
.people-panel { position: absolute; z-index: 3; width: 460px; inset: 24px 24px 24px auto; display: flex; flex-direction: column; border: 1px solid #ffffff12; border-radius: 20px; background: color-mix(in srgb, var(--color-neutral-950) 96%, white); box-shadow: 0 24px 64px #0004; overflow: hidden; }
.people-panel__header { padding: 24px 24px 18px; border-bottom: 1px solid #ffffff0d; }
.people-panel h2 { font-size: 19px; font-weight: 550; color: #f1f6f9; letter-spacing: -.025em; }
.people-panel__count { color: #8d9caa; font-size: 11px; font-variant-numeric: tabular-nums; }
.people-panel__filters { display: grid; grid-template-columns: minmax(0, 1fr) 125px; gap: 8px; margin-top: 18px; }
.people-panel__header p { margin-top: 6px; color: #7f8c9d; font-size: 12px; }
.people-panel__select { width: 100%; height: 40px; padding: 0 12px; border: 1px solid #ffffff18; border-radius: 6px; background: #101620; font-size: 13px; color: #c3cedb; color-scheme: dark; }
.people-panel__select:focus-visible { outline: 2px solid var(--ui-primary); outline-offset: 2px; }
.people-panel__results { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; scrollbar-color: #34453f transparent; }
.people-panel__list > li { position: relative; min-width: 0; }
.people-panel__profile { position: absolute; right: 4px; top: 50%; transform: translateY(-50%); display: grid; place-items: center; width: 30px; height: 36px; color: #8d9caa; border-radius: 6px; }
.people-panel__profile:hover, .people-panel__profile:focus-visible { color: var(--ui-primary); background: #ffffff0a; }
.people-panel__list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px; padding: 16px 12px; }
.people-panel__person { display: flex; width: 100%; text-align: left; align-items: center; gap: 10px; padding: 16px 32px 16px 10px; border-radius: 10px; transition: background 120ms ease; }
.people-panel__person:hover, .people-panel__person:focus-visible, .people-panel__person.is-located { background: #ffffff06; outline: 1px solid #00dc8233; }
.people-panel__avatar { width: 36px; height: 36px; border-radius: 50%; background: #19212c; flex-shrink: 0; }
.people-panel__identity { min-width: 0; flex: 1; }
.people-panel__username { white-space: nowrap; display: block; overflow: hidden; text-overflow: ellipsis; color: #dce6ef; font-size: 13px; font-weight: 500; }
.people-panel__country { display: block; margin-top: 3px; color: #7b8b9b; font-size: 11px; }
.people-panel__about { margin-top: 8px; font-size: 10px; color: #78899a; }
.people-panel__about summary { cursor: pointer; padding: 6px 0; }
.people-panel__footer { border-top: 1px solid #ffffff0d; padding: 10px 20px 16px; }
.people-panel__pagination { display: flex; align-items: center; justify-content: space-between; color: #9ba8b8; font-size: 11px; font-variant-numeric: tabular-nums; }
.people-panel__pagination :deep(button) { width: 40px; height: 40px; justify-content: center; }
.people-panel__footer p { margin-top: 8px; color: #78899a; font-size: 10px; line-height: 1.6; }
.people-panel__footer a { text-decoration: underline; text-underline-offset: 2px; }
.people-panel__empty { display: grid; place-content: center; justify-items: center; gap: 12px; height: 100%; min-height: 140px; color: #91a2b3; text-align: center; font-size: 13px; padding: 24px; }
.people-panel__toggle { display: none; }
@media (min-width: 1600px) { .people-panel { width: 500px; right: 40px; top: 32px; bottom: 32px; } .people-explorer__map { right: 460px; } }
@media (max-width: 1023px) and (min-width: 768px) { .people-panel { width: 330px; right: 16px; } .people-explorer__map { right: 290px; } .people-explorer__heading { left: 24px; } .people-explorer__hint { display: none; } }
@media (max-width: 767px) {
  .people-explorer__heading { top: 20px; left: 16px; }
  .people-explorer h1 { font-size: 30px; }
  .people-explorer__heading > p:last-child { font-size: 13px; margin-top: 8px; }
  .people-explorer__map { inset: 0 0 25%; }
  .people-explorer__map :deep(.people-globe__controls) { top: 90px; left: 12px; flex-direction: column; }
  .people-explorer__map :deep(.people-globe__controls button) { width: 36px; height: 36px; }
  .people-explorer__curtain { inset: auto 0 0; width: 100%; height: 100px; background: linear-gradient(transparent, var(--color-neutral-950)); }
  .people-explorer__hint { display: none; }
  .people-panel { inset: auto 0 0; width: 100%; height: 43%; border-radius: 22px 22px 0 0; border-bottom: 0; background: color-mix(in srgb, var(--color-neutral-950) 96%, white); }
  .people-explorer--expanded .people-panel { height: 80%; }
  .people-panel__toggle { display: flex; flex-shrink: 0; align-items: center; justify-content: center; gap: 6px; width: 100%; height: 38px; padding-top: 9px; color: #9eacb9; font-size: 10px; position: relative; }
  .people-panel__handle { position: absolute; top: 7px; left: calc(50% - 16px); width: 32px; height: 3px; border-radius: 4px; background: #53616d; }
  .people-panel__header { padding: 6px 16px 12px; }
  .people-panel h2 { font-size: 17px; }
  .people-panel__header p { display: none; }
  .people-panel__filters { margin-top: 10px; }
  .people-panel__select { font-size: 12px; }
  .people-panel__footer { padding: 4px 16px max(8px, env(safe-area-inset-bottom)); }
  .people-panel__about { display: none; }
  .people-explorer--expanded .people-panel__about { display: block; }
  .people-panel__person { padding: 12px 30px 12px 8px; }
  .people-panel__username { font-size: 12px; }
  .people-panel { transition: height 220ms cubic-bezier(.2,.8,.2,1); }
}
@media (prefers-reduced-motion: reduce) { .people-panel { transition: none; } }
</style>
