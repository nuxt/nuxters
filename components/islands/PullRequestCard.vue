
<script lang="ts" setup>
defineProps<{ pullRequests: String }>()
</script>

<template>
  <div class="rounded-xl border p-6 text-center flex flex-col items-center justify-end relative h-full border-violet-400">
    <div class="absolute top-0 left-0 right-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="456" height="263" fill="none">
        <g filter="url(#a)">
          <g clip-path="url(#b)">
            <rect width="374" height="265" fill="#020420" fill-opacity=".5" rx="12" />
            <rect width="374" height="265" fill="url(#c)" fill-opacity=".4" rx="12" />
            <g clip-path="url(#d)">
              <path fill="url(#e)" fill-rule="evenodd"
                d="M92.751 26.63h8.044a7.306 7.306 0 0 1 6.998 7.3v16.234a8.919 8.919 0 0 0 3.803 7.313H-111V59.1h233.246v26.294h1.624V59.1h71.165v-1.623H122.741v-.007h-6.018a7.306 7.306 0 0 1-7.306-7.306V33.93a8.92 8.92 0 0 0-3.785-7.3h204.486v26.313h1.623V26.63h173.09v-1.624H100.827a9.14 9.14 0 0 0-.34-.006h-7.764v1.623h.028v.007ZM222.543 59.1h83.703v-1.623h-99.847v.012h-.813v1.624h11.84a7.306 7.306 0 0 1 7.306 7.306v16.235a8.918 8.918 0 0 0 3.776 7.293H127.659v1.624h105.522c.159.008.319.012.48.012h.337v-.012h.001v-1.624h-.772a7.306 7.306 0 0 1-6.872-7.293V66.419a8.919 8.919 0 0 0-3.812-7.319ZM117.918 91.57H60.081a8.92 8.92 0 0 1 3.922 7.395V115.2a7.307 7.307 0 0 0 6.164 7.217h2.292v1.624h-.001v.089h-1.149c-.429 0-.85-.031-1.264-.089H-111v-1.624H66.05a8.916 8.916 0 0 1-3.67-7.217V98.965a7.306 7.306 0 0 0-7.306-7.306h-11.84v-.088H-111v-1.624h228.918v1.624Zm200.918 0h-7.72V89.91h6.97c.279 0 .556.013.829.038h51.917v1.624h-47.557a8.92 8.92 0 0 1 3.74 7.267v16.236a7.306 7.306 0 0 0 7.306 7.305h6.019v1.624h-.812v.038H82.2v-1.624h247.04a8.918 8.918 0 0 1-3.849-7.343V98.838a7.307 7.307 0 0 0-6.555-7.267ZM82.199 26.63H-111v-1.624H82.199v1.624ZM484.83 59.427H316.998v-1.623h167.833v1.623ZM301.375 91.571H243.74v-1.624h57.635v1.624Zm183.456 32.47h-134.75v-1.624h134.75v1.624Z"
                clip-rule="evenodd" />
              <circle cx="123.171" cy="90.804" r="4.871" stroke="#8B5CF6" stroke-width="1.624" />
            <circle cx="77.33" cy="123.123" r="4.871" stroke="#8B5CF6" stroke-opacity=".45" stroke-width="1.624" />
            <circle cx="238.87" cy="90.829" r="4.871" stroke="#8B5CF6" stroke-width="1.624" />
            <circle cx="200.717" cy="58.341" r="4.871" stroke="#8B5CF6" stroke-width="1.624" />
            <circle cx="87.128" cy="25.871" r="4.871" stroke="#8B5CF6" stroke-opacity=".44" stroke-width="1.624" />
            <circle cx="311.117" cy="58.429" r="4.871" stroke="#8B5CF6" stroke-opacity=".3" stroke-width="1.624" />
            <circle cx="306.246" cy="90.66" r="4.871" stroke="#8B5CF6" stroke-opacity=".64" stroke-width="1.624" />
            <circle cx="345.21" cy="123.13" r="4.871" stroke="#8B5CF6" stroke-opacity=".1" stroke-width="1.624" />
          </g>
        </g>
      </g>
      <defs>
        <radialGradient id="e" cx="0" cy="0" r="1"
          gradientTransform="rotate(.083 -57653.255 5914.485) scale(345.5 2076.68)" gradientUnits="userSpaceOnUse">
          <stop stop-color="#8B5CF6" stop-opacity="0" />
          <stop offset=".557" stop-color="#8B5CF6" />
          <stop offset="1" stop-color="#8B5CF6" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="c" x1="-95.982" x2="154.726" y1="-44.5" y2="289.244" gradientUnits="userSpaceOnUse">
          <stop stop-color="#8B5CF6" />
          <stop offset="1" stop-color="#8B5CF6" stop-opacity="0" />
        </linearGradient>
        <filter id="a" width="426" height="317" x="-26" y="-26" color-interpolation-filters="sRGB"
          filterUnits="userSpaceOnUse">
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feGaussianBlur in="BackgroundImageFix" stdDeviation="13" />
          <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_186_15115" />
          <feBlend in="SourceGraphic" in2="effect1_backgroundBlur_186_15115" result="shape" />
        </filter>
      </defs>
    </svg>
  </div>
  <span class="text-5xl font-medium">{{ pullRequests }}</span>
  <span class="text-2xl">Pull Requests</span>
</div></template>
