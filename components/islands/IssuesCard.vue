
<script lang="ts" setup>
defineProps<{ issues: number }>()
const format = useNumberFormatter()
</script>

<template>
  <div
    class="rounded-xl border p-6 text-center flex flex-col items-center justify-end relative h-full border-green-400">
    <div class="absolute top-0 left-0 right-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="352" height="263" fill="none">
        <g filter="url(#a)">
          <g clip-path="url(#b)">
            <rect width="374" height="265" fill="#020420" fill-opacity=".5" rx="12" />
            <rect width="374" height="265" fill="url(#c)" fill-opacity=".4" rx="12" />
            <g clip-path="url(#d)" opacity=".5" shape-rendering="crispEdges">
              <g filter="url(#e)">
                <circle cx="187" cy="29" r="100" fill="#00DC82" fill-opacity=".1" />
                <circle cx="187" cy="29" r="99.5" stroke="#00BD6F" stroke-opacity=".25" />
              </g>
              <g filter="url(#f)">
                <circle cx="186" cy="28" r="77" fill="#00DC82" fill-opacity=".2" />
                <circle cx="186" cy="28" r="76.5" stroke="#00BD6F" stroke-opacity=".25" />
            </g>
            <g filter="url(#g)">
              <circle cx="186" cy="28" r="55" fill="#00DC82" fill-opacity=".3" />
              <circle cx="186" cy="28" r="54.5" stroke="#00BD6F" stroke-opacity=".25" />
            </g>
            <g filter="url(#h)">
              <circle cx="186.5" cy="28.5" r="37.5" fill="#00DC82" fill-opacity=".5" />
              <circle cx="186.5" cy="28.5" r="37" stroke="#00BD6F" stroke-opacity=".25" />
            </g>
          </g>
          <path fill="#00DC82" fill-rule="evenodd"
            d="M168.583 28.999a17.417 17.417 0 1 1 34.835 0 17.417 17.417 0 0 1-34.835 0ZM186 8.832c-11.138 0-20.167 9.03-20.167 20.167 0 11.137 9.029 20.166 20.167 20.166 11.137 0 20.166-9.029 20.166-20.166 0-11.138-9.029-20.167-20.166-20.167Zm0 23.833A3.664 3.664 0 0 0 189.666 29a3.665 3.665 0 0 0-6.259-2.593 3.665 3.665 0 0 0 2.593 6.26Z"
            clip-rule="evenodd" />
        </g>
      </g>
      <defs>
        <filter id="a" width="426" height="317" x="-26" y="-26" color-interpolation-filters="sRGB"
          filterUnits="userSpaceOnUse">
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feGaussianBlur in="BackgroundImageFix" stdDeviation="13" />
          <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_186_15103" />
          <feBlend in="SourceGraphic" in2="effect1_backgroundBlur_186_15103" result="shape" />
        </filter>
        <filter id="e" width="218" height="218" x="78" y="-80" color-interpolation-filters="sRGB"
          filterUnits="userSpaceOnUse">
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
          <feOffset />
          <feGaussianBlur stdDeviation="4.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_186_15103" />
          <feBlend in="SourceGraphic" in2="effect1_dropShadow_186_15103" result="shape" />
        </filter>
        <filter id="f" width="172" height="172" x="100" y="-58" color-interpolation-filters="sRGB"
          filterUnits="userSpaceOnUse">
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
          <feOffset />
          <feGaussianBlur stdDeviation="4.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_186_15103" />
          <feBlend in="SourceGraphic" in2="effect1_dropShadow_186_15103" result="shape" />
        </filter>
        <filter id="g" width="128" height="128" x="122" y="-36" color-interpolation-filters="sRGB"
          filterUnits="userSpaceOnUse">
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
          <feOffset />
          <feGaussianBlur stdDeviation="4.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_186_15103" />
          <feBlend in="SourceGraphic" in2="effect1_dropShadow_186_15103" result="shape" />
        </filter>
        <filter id="h" width="93" height="93" x="140" y="-18" color-interpolation-filters="sRGB"
          filterUnits="userSpaceOnUse">
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
          <feOffset />
          <feGaussianBlur stdDeviation="4.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_186_15103" />
          <feBlend in="SourceGraphic" in2="effect1_dropShadow_186_15103" result="shape" />
        </filter>
        <linearGradient id="c" x1="-95.982" x2="154.726" y1="-44.5" y2="289.244" gradientUnits="userSpaceOnUse">
          <stop stop-color="#00DC82" />
          <stop offset="1" stop-color="#00DC82" stop-opacity="0" />
        </linearGradient>
      </defs>
    </svg>
  </div>
  <span class="text-5xl font-medium">{{ format(issues) }}</span>
  <span class="text-2xl">{{ issues === 1 ? 'Issue' : 'Issues' }}</span>
</div></template>
