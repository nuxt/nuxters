<script setup lang="ts">
const unlockList = [
  { icon: 'i-lucide-git-pull-request-arrow', text: 'Get a pull request merged' },
  { icon: 'i-lucide-circle-dot', text: 'Open an issue that is completed or gets 3+ reactions or 5+ comments' },
  { icon: 'i-lucide-message-circle-heart', text: 'Write a comment that gets 3+ reactions' },
]
</script>

<template>
  <section>
    <div class="home-join">
      <header class="home-join__copy">
        <p class="home-join__eyebrow">
          Join the community
        </p>
        <h2>Become a <span>Nuxter</span></h2>
        <p>Connect GitHub to find your Nuxt contributions, unlock your role on Discord, and share your Nuxter profile.</p>
      </header>

      <ul class="home-join__criteria">
        <li
          v-for="item in unlockList"
          :key="item.text"
        >
          <UIcon
            :name="item.icon"
            class="home-join__icon"
            aria-hidden="true"
          />
          <span>{{ item.text }}</span>
        </li>
      </ul>

      <div class="home-join__action">
        <HomeCard />
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-join {
  --join-gap: clamp(2rem, 4vw, 4rem);
  display: grid;
  grid-template-areas: 'copy' 'criteria' 'action';
  gap: var(--join-gap);
  overflow: hidden;
  padding: clamp(2rem, 5vw, 5rem);
  border: 1px solid var(--color-slate-800);
  border-radius: 0.5rem;
  background: radial-gradient(circle at 50% 110%, color-mix(in srgb, var(--ui-primary) 20%, transparent), transparent 42%), linear-gradient(to bottom, color-mix(in srgb, var(--color-slate-800) 50%, transparent), color-mix(in srgb, var(--color-slate-900) 50%, transparent));
  color: var(--color-slate-100);
}

.home-join__copy {
  grid-area: copy;
}

.home-join__eyebrow {
  margin-bottom: 0.75rem;
  color: var(--ui-primary);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.home-join__copy h2 {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
}

.home-join__copy h2 span {
  color: var(--color-green-400);
}

.home-join__copy > p:last-child {
  max-width: 48rem;
  margin-top: 1rem;
  color: var(--color-slate-300);
  font-size: clamp(1rem, 1.5vw, 1.125rem);
  line-height: 1.6;
}

.home-join__criteria {
  grid-area: criteria;
  display: grid;
  gap: 0.9rem;
  color: var(--color-slate-300);
}

.home-join__criteria li {
  display: grid;
  grid-template-columns: 1.25rem 1fr;
  gap: 0.75rem;
  align-items: start;
  line-height: 1.5;
}

.home-join__icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.1rem;
  color: var(--color-green-400);
}

.home-join__action {
  grid-area: action;
  align-self: center;
}

@media (min-width: 900px) {
  .home-join {
    grid-template-areas: 'copy' 'action' 'criteria';
    padding-block: 3rem;
    text-align: center;
  }

  .home-join__eyebrow {
    display: none;
  }

  .home-join__copy > p:last-child {
    margin-inline: auto;
  }

  .home-join__criteria {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    text-align: left;
  }

  .home-join__action {
    justify-self: center;
  }

  .home-join__criteria li {
    justify-self: center;
  }
}
</style>
