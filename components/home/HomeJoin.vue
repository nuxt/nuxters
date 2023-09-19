<template>
  <ULandingCTA
    :ui="{ wrapper: 'relative bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-slate-800 rounded-lg' }"
    description="Become a Nuxter and help shape the future of Nuxt. Contribute, collaborate and join our community today!">
    <template #title>
      Ready to <span class="text-green-400">Join us</span>?
    </template>
    <template #links>
      <UButton to="https://github.com/nuxt/nuxt" icon="i-simple-icons-github" label="Nuxt"
        :ui="{ rounded: 'rounded-full' }" class="px-7 z-10" variant="outline" color="gray" target="_blank"
        aria-label="nuxt" />
      <UButton to="https://nuxt.com/modules" icon="i-simple-icons-github" label="Nuxt Modules"
        :ui="{ rounded: 'rounded-full' }" class="px-7 z-10" variant="outline" color="gray" target="_blank"
        aria-label="nuxt module" />
    </template>
    <div
      class="absolute inset-0 w-full h-full bg-[url('/join-gradient-bg-sm.svg')] lg:bg-[url('/join-gradient-bg.svg')] bg-no-repeat bg-bottom" />
  </ULandingCTA>
  <!-- <div class="bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-slate-800 rounded-lg ">
    <div class="bg-[url('/join-gradient-bg-sm.svg')] lg:bg-[url('/join-gradient-bg.svg')] bg-no-repeat bg-bottom flex flex-col gap-y-3 text-slate-100 items-center justify-center  py-[72px] px-4 sm:px-6 md:px-16 lg:px-[172px]">
      <h1 class="text-4xl font-bold text-center">
        Ready to <span class="text-green-400">Join us</span>?
      </h1>
      <p class="text-slate-300 text-base sm:text-lg lg:text-xl text-center">
        Become a Nuxter and help shape the future of Nuxt.
        Contribute, collaborate and join our community today!
      </p>
      <div class="pt-8 flex flex-col gap-y-4 sm:flex-row gap-x-4 items-center">
        <UButton to="https://github.com/nuxt/nuxt" icon="i-simple-icons-github" label="Nuxt" :ui="{ rounded: 'rounded-full'}" class="px-7" variant="outline" color="gray" target="_blank" aria-label="nuxt" />
        <UButton to="https://nuxt.com/modules" icon="i-simple-icons-github" label="Nuxt Modules" :ui="{ rounded: 'rounded-full'}" class="px-7" variant="outline" color="gray" target="_blank" aria-label="nuxt module" />
      </div>
    </div>
  </div> -->
</template>
