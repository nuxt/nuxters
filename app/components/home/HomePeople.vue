<script setup lang="ts">
import type { PeopleLocation } from '~/data/people'
import type { Contributor } from '~~/shared/types'
import { usePeopleMap } from '~/composables/usePeopleMap'
import { peopleMapFallback } from '~/data/people'

const { data: peopleMap } = usePeopleMap({ lazy: true, server: false })
const map = computed(() => peopleMap.value ?? peopleMapFallback)
const profileOpen = ref(false)
const profileUsername = ref<string>()
const profileContributor = shallowRef<Contributor>()
const profileStatus = ref<'idle' | 'pending' | 'success' | 'error'>('idle')

const COUNTRY_CODE_OVERRIDES: Record<string, string> = {
  'Afghanistan': 'AF',
  'Aland Islands': 'AX',
  'Andorra': 'AD',
  'Belize': 'BZ',
  'Bhutan': 'BT',
  'Democratic Republic of the Congo': 'CD',
  'Guatemala': 'GT',
  'Honduras': 'HN',
  'Hong Kong': 'HK',
  'Ivory Coast': 'CI',
  'Kosovo': 'XK',
  'Kuwait': 'KW',
  'Luxembourg': 'LU',
  'Mozambique': 'MZ',
  'North Macedonia': 'MK',
  'Palestinian Territory': 'PS',
  'Paraguay': 'PY',
  'Qatar': 'QA',
  'Republic of the Congo': 'CG',
  'Rwanda': 'RW',
  'South Sudan': 'SS',
  'Timor Leste': 'TL',
  'Togo': 'TG',
  'Zambia': 'ZM',
}

function countryKey(country: string): string {
  return country.toLowerCase().replace(/^the\s+/, '')
}

const peopleLocations = computed<PeopleLocation[]>(() => {
  const codes = new Map(Object.entries(COUNTRY_CODE_OVERRIDES).map(([country, code]) => [countryKey(country), code]))
  for (const location of map.value.locations) {
    const match = /^country-([a-z]{2})$/.exec(location.id)
    if (match?.[1])
      codes.set(countryKey(location.country), match[1].toUpperCase())
  }

  const countries = new Map<string, { location: PeopleLocation, people: Set<string> }>()
  for (const location of map.value.locations) {
    const key = countryKey(location.country)
    const code = codes.get(key)
    const existing = countries.get(key)
    const representative = !existing || location.precision === 'country'
      ? {
          ...location,
          id: code ? `country-${code.toLowerCase()}` : `country-${key.replace(/[^a-z0-9]+/g, '-')}`,
          label: location.country.replace(/^The\s+/, ''),
          precision: 'country' as const,
        }
      : existing.location
    const people = existing?.people ?? new Set<string>()
    location.people.forEach(username => people.add(username))
    countries.set(key, { location: representative, people })
  }

  return [...countries.values()]
    .map(({ location, people }) => ({ ...location, people: [...people] }))
    .toSorted((a, b) => b.people.length - a.people.length || a.label.localeCompare(b.label))
})

async function openContributor(username: string): Promise<void> {
  profileUsername.value = username
  profileContributor.value = undefined
  profileStatus.value = 'pending'
  profileOpen.value = true

  try {
    const contributor = await $fetch<Contributor>(`/api/contributors/${username}`)
    if (profileUsername.value === username) {
      profileContributor.value = contributor
      profileStatus.value = 'success'
    }
  }
  catch {
    if (profileUsername.value === username)
      profileStatus.value = 'error'
  }
}
</script>

<template>
  <section
    id="community-map"
    class="home-people scroll-mt-24"
    aria-labelledby="community-map-title"
  >
    <div class="home-people__experience">
      <header class="home-people__intro">
        <p class="home-people__eyebrow">
          Nuxt community
        </p>
        <h1 id="community-map-title">
          Are you a <span>Nuxter</span>?
        </h1>
        <p>
          See how you have contributed, unlock any Discord roles you have earned, and join the people shaping Nuxt worldwide.
        </p>
      </header>

      <div class="home-people__globe">
        <ClientOnly>
          <PeopleGlobalPeopleGlobe
            compact
            :locations="peopleLocations"
            show-avatars
            @select-contributor="openContributor"
          />
          <template #fallback>
            <div
              class="home-people__placeholder"
              aria-label="Loading globe"
            />
          </template>
        </ClientOnly>

        <dl class="home-people__stats">
          <div>
            <dd>{{ map.totalContributors.toLocaleString() }}</dd>
            <dt>Nuxters</dt>
          </div>
          <div>
            <dd>{{ peopleLocations.length.toLocaleString() }}</dd>
            <dt>Countries</dt>
          </div>
        </dl>
      </div>
    </div>

    <USlideover
      v-model:open="profileOpen"
      :title="profileUsername ? `${profileUsername} is a Nuxter` : 'Nuxter profile'"
      description="Nuxt contribution summary"
      :ui="{
        content: 'bg-neutral-950 ring-1 ring-neutral-800 sm:max-w-md',
        header: 'border-b border-neutral-800',
        body: 'p-0',
      }"
    >
      <template #body>
        <div
          v-if="profileStatus === 'pending'"
          class="grid gap-5 p-6"
        >
          <USkeleton class="size-24 rounded-full" />
          <USkeleton class="h-8 w-48" />
          <USkeleton class="h-32 w-full rounded-xl" />
        </div>

        <div
          v-else-if="profileStatus === 'error'"
          class="grid min-h-64 place-content-center gap-4 p-6 text-center text-neutral-300"
        >
          <UIcon
            name="i-ph-warning-circle"
            class="mx-auto size-8 text-amber-400"
          />
          <p>We could not load this Nuxter profile.</p>
        </div>

        <div
          v-else-if="profileContributor"
          class="text-neutral-300"
        >
          <div class="bg-[url('/card-gradient-bg.svg')] bg-cover bg-center p-6 sm:p-8">
            <NuxtImg
              :src="profileContributor.username"
              :alt="profileContributor.username"
              width="112"
              height="112"
              class="size-28 rounded-full ring-2 ring-primary-400"
            />
            <UButton
              :to="`https://github.com/${profileContributor.username}`"
              target="_blank"
              color="neutral"
              variant="link"
              icon="i-simple-icons-github"
              class="mt-4 px-0"
            >
              <span class="text-2xl text-white">{{ profileContributor.username }}</span>
            </UButton>
            <div class="mt-3 flex items-center gap-5">
              <span class="text-neutral-400"><strong class="text-xl text-white">#{{ profileContributor.rank.toLocaleString() }}</strong> rank</span>
              <span class="h-8 w-px bg-neutral-700" />
              <span class="text-neutral-400"><strong class="text-xl text-white">{{ profileContributor.score.toLocaleString() }}</strong> pts</span>
            </div>
          </div>

          <dl class="grid grid-cols-2 gap-px bg-neutral-800 border-y border-neutral-800">
            <div class="bg-neutral-950 p-5">
              <dt class="text-sm text-neutral-400">
                Merged PRs
              </dt>
              <dd class="mt-1 text-2xl font-semibold text-white">
                {{ profileContributor.merged_pull_requests.all.toLocaleString() }}
              </dd>
            </div>
            <div class="bg-neutral-950 p-5">
              <dt class="text-sm text-neutral-400">
                Helpful issues
              </dt>
              <dd class="mt-1 text-2xl font-semibold text-white">
                {{ profileContributor.helpful_issues.toLocaleString() }}
              </dd>
            </div>
            <div class="bg-neutral-950 p-5">
              <dt class="text-sm text-neutral-400">
                Helpful comments
              </dt>
              <dd class="mt-1 text-2xl font-semibold text-white">
                {{ profileContributor.helpful_comments.toLocaleString() }}
              </dd>
            </div>
            <div class="bg-neutral-950 p-5">
              <dt class="text-sm text-neutral-400">
                Reactions
              </dt>
              <dd class="mt-1 text-2xl font-semibold text-white">
                {{ profileContributor.reactions.toLocaleString() }}
              </dd>
            </div>
          </dl>

          <div class="grid gap-3 p-6 sm:p-8">
            <UButton
              :to="`/${profileContributor.username}`"
              label="View full Nuxter profile"
              icon="i-ph-arrow-up-right"
              trailing
              size="xl"
              color="primary"
            />
            <UButton
              :to="`https://github.com/${profileContributor.username}`"
              target="_blank"
              label="Open on GitHub"
              icon="i-simple-icons-github"
              size="xl"
              color="neutral"
              variant="outline"
            />
          </div>
        </div>
      </template>
    </USlideover>
  </section>
</template>

<style scoped>
.home-people__experience {
  position: relative;
  display: grid;
  min-height: 34rem;
  margin-inline: -1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  overflow: clip;
  isolation: isolate;
}

.home-people__intro {
  position: relative;
  z-index: 2;
  max-width: 46rem;
  padding: clamp(2rem, 4vw, 3rem);
  align-self: center;
}

.home-people__eyebrow {
  margin-bottom: 1rem;
  color: var(--ui-primary);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.home-people h1 {
  color: white;
  font-size: clamp(2.5rem, 4.5vw, 4rem);
  font-weight: 700;
  letter-spacing: -0.055em;
  line-height: 0.98;
  text-wrap: balance;
}

.home-people h1 span {
  color: var(--color-green-400);
}

.home-people__intro > p:last-child {
  max-width: 40rem;
  margin-top: 1.5rem;
  color: var(--color-neutral-300);
  font-size: 1.05rem;
  line-height: 1.7;
}

.home-people__globe {
  position: relative;
  z-index: 1;
  display: grid;
  min-width: 0;
  place-items: center;
}

.home-people__globe::before {
  position: absolute;
  z-index: -1;
  inset: 12%;
  border-radius: 50%;
  background: color-mix(in srgb, var(--ui-primary) 18%, transparent);
  content: '';
  filter: blur(5rem);
  pointer-events: none;
}

.home-people__globe :deep(.people-globe) {
  width: min(38vw, 34rem);
  max-width: none;
}

.home-people__stats {
  position: absolute;
  z-index: 5;
  left: 50%;
  bottom: clamp(1.5rem, 4vw, 3rem);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  pointer-events: none;
  transform: translateX(-50%);
}

.home-people__stats div {
  display: flex;
  align-items: baseline;
  gap: 0.45rem;
}

.home-people__stats div + div {
  padding-left: 1.5rem;
  border-left: 1px solid var(--color-neutral-700);
}

.home-people__stats dt {
  color: var(--ui-text-muted);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.home-people__stats dd {
  color: var(--ui-primary);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.home-people__placeholder {
  width: min(38vw, 34rem);
  aspect-ratio: 1;
  background: radial-gradient(circle, var(--ui-bg-elevated), transparent 68%);
}

@media (min-width: 640px) {
  .home-people__experience {
    margin-inline: -1.5rem;
  }
}

@media (min-width: 1024px) {
  .home-people__experience {
    margin-inline: -2rem;
  }
}

@media (max-width: 900px) {
  .home-people__experience {
    min-height: auto;
    grid-template-columns: 1fr;
  }

  .home-people__intro {
    padding-bottom: 1rem;
  }

  .home-people__globe {
    height: 22rem;
    place-items: center;
  }

  .home-people__globe :deep(.people-globe),
  .home-people__placeholder {
    width: 24rem;
    max-width: 100%;
  }
}

@media (max-width: 520px) {
  .home-people__intro {
    padding-inline: 1rem;
  }

  .home-people__stats {
    bottom: 0;
  }
}
</style>
