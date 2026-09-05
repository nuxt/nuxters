<script setup lang="ts">
const { data: people, error, refresh } = usePeopleMap()
</script>

<template>
  <section
    id="community-map"
    class="home-people"
    aria-labelledby="community-map-title"
  >
    <div class="home-people__intro">
      <p class="home-people__eyebrow">
        Nuxt community
      </p>
      <h1 id="community-map-title">
        Are you a <span>Nuxter</span>?
      </h1>
      <p class="home-people__description">
        See how you have contributed, unlock any Discord roles you have earned, and meet the people building Nuxt around the world.
      </p>
      <UButton
        to="/people"
        label="Explore the community"
        icon="i-lucide-arrow-up-right"
        trailing
        size="xl"
        class="mt-7"
      />
    </div>
    <div class="home-people__world">
      <ClientOnly>
        <LazyPeopleGlobalPeopleGlobe
          v-if="people"
          :countries="people.countries"
          @select="country => navigateTo({ path: '/people', query: { country } })"
        />
        <template #fallback>
          <div class="home-people__placeholder" />
        </template>
      </ClientOnly>
      <dl
        v-if="people"
        class="home-people__stats"
      >
        <div><dd>{{ people.totalContributors.toLocaleString('en-US') }}</dd><dt>Nuxters</dt></div>
        <div><dd>{{ people.countries.length }}</dd><dt>Countries</dt></div>
      </dl>
      <UButton
        v-if="error"
        label="Reload community map"
        variant="link"
        @click="refresh()"
      />
    </div>
  </section>
</template>

<style scoped>
.home-people { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 3rem; min-height: 31rem; }
.home-people__eyebrow { color: var(--ui-primary); font-size: 12px; letter-spacing: .14em; text-transform: uppercase; font-weight: 600; margin-bottom: 20px; }
.home-people h1 { font-size: clamp(2.8rem, 4.8vw, 4.5rem); font-weight: 650; line-height: 1.06; letter-spacing: -.06em; color: white; }
.home-people h1 span { color: var(--ui-primary); }
.home-people__description { max-width: 33rem; margin-top: 24px; font-size: 17px; line-height: 1.75; color: #a8b2c0; }
.home-people__world { position: relative; width: 100%; max-width: 32rem; aspect-ratio: 1; justify-self: center; }
.home-people__world::before { content: ''; position: absolute; inset: 8%; border-radius: 50%; background: #00dc820a; filter: blur(35px); }
.home-people__placeholder { width: 100%; aspect-ratio: 1; }
.home-people__stats { display: flex; justify-content: center; gap: 32px; color: var(--ui-primary); font-variant-numeric: tabular-nums; }
.home-people__stats div { display: flex; align-items: baseline; gap: 8px; }
.home-people__stats dd { font-size: 17px; font-weight: 600; }
.home-people__stats dt { color: #8b96a5; font-size: 11px; text-transform: uppercase; letter-spacing: .08em; }
@media (max-width: 767px) { .home-people { grid-template-columns: 1fr; gap: 12px; } .home-people__world { max-width: 24rem; } .home-people__description { font-size: 16px; } }
</style>
