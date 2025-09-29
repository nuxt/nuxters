<script lang="ts" setup>
defineProps<{ comments: number }>()
const format = useNumberFormatter()
</script>

<template>
  <div class="rounded-xl border p-6 text-center flex flex-col items-center justify-end relative h-full border-blue-400 overflow-hidden">
    <div class="absolute top-0 left-0 right-0">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="398"
        height="263"
        fill="none"
      >
        <g filter="url(#a)">
          <g clip-path="url(#b)">
            <rect
              width="374"
              height="265"
              fill="#020420"
              fill-opacity=".5"
              rx="12"
            />
            <rect
              width="374"
              height="265"
              fill="url(#c)"
              fill-opacity=".4"
              rx="12"
            />

            <g clip-path="url(#d)">
              <g clip-path="url(#e)">
                <rect
                  width="144"
                  height="37"
                  x="256"
                  y="2"
                  fill="url(#f)"
                  fill-opacity=".1"
                  rx="4"
                />
                <path
                  fill="url(#g)"
                  fill-opacity=".5"
                  fill-rule="evenodd"
                  d="M296 12a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h92a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2h-92Zm0 11a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h58a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2h-58Z"
                  clip-rule="evenodd"
                />
                <path
                  fill="#40BBFF"
                  fill-opacity=".5"
                  fill-rule="evenodd"
                  d="M266.707 13.334a.208.208 0 0 0-.208.208V23.96c0 .115.093.208.208.208h2.084a.624.624 0 0 1 .625.625v2.659l3.1-3.1a.625.625 0 0 1 .442-.184h8.333a.208.208 0 0 0 .208-.208V13.542a.209.209 0 0 0-.208-.208h-14.584Zm-1.458.208c0-.805.653-1.458 1.458-1.458h14.584c.805 0 1.458.653 1.458 1.458V23.96a1.456 1.456 0 0 1-1.458 1.458h-8.075l-2.978 2.978a1.215 1.215 0 0 1-2.072-.858v-2.12h-1.459a1.46 1.46 0 0 1-1.458-1.458V13.542Z"
                  clip-rule="evenodd"
                />
              </g>
              <g
                fill="#40BBFF"
                clip-path="url(#h)"
              >
                <rect
                  width="144"
                  height="37"
                  x="104"
                  y="2"
                  fill-opacity=".1"
                  rx="4"
                />
                <rect
                  width="96"
                  height="5"
                  x="142"
                  y="12"
                  fill-opacity=".5"
                  rx="2"
                />
                <rect
                  width="62"
                  height="5"
                  x="142"
                  y="23"
                  fill-opacity=".5"
                  rx="2"
                />
                <path
                  fill-rule="evenodd"
                  d="M114.707 13.334a.208.208 0 0 0-.208.208V23.96c0 .115.093.208.208.208h2.084a.624.624 0 0 1 .625.625v2.659l3.1-3.1a.625.625 0 0 1 .442-.184h8.333a.208.208 0 0 0 .208-.208V13.542a.209.209 0 0 0-.208-.208h-14.584Zm-1.458.208c0-.805.653-1.458 1.458-1.458h14.584c.805 0 1.458.653 1.458 1.458V23.96a1.456 1.456 0 0 1-1.458 1.458h-8.075l-2.978 2.978a1.215 1.215 0 0 1-2.072-.858v-2.12h-1.459a1.46 1.46 0 0 1-1.458-1.458V13.542Z"
                  clip-rule="evenodd"
                />
              </g>
              <g clip-path="url(#i)">
                <rect
                  width="144"
                  height="37"
                  x="279"
                  y="47"
                  fill="url(#j)"
                  fill-opacity=".1"
                  rx="4"
                />
                <path
                  fill="url(#k)"
                  fill-opacity=".5"
                  fill-rule="evenodd"
                  d="M319 57a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h92a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2h-92Zm0 11a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h58a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2h-58Z"
                  clip-rule="evenodd"
                />
                <path
                  fill="#40BBFF"
                  fill-opacity=".5"
                  fill-rule="evenodd"
                  d="M289.707 58.334a.208.208 0 0 0-.208.208V68.96c0 .115.093.208.208.208h2.084a.624.624 0 0 1 .625.625v2.659l3.1-3.1a.625.625 0 0 1 .442-.184h8.333a.208.208 0 0 0 .208-.208V58.542a.209.209 0 0 0-.208-.208h-14.584Zm-1.458.208c0-.805.653-1.458 1.458-1.458h14.584c.805 0 1.458.653 1.458 1.458V68.96a1.456 1.456 0 0 1-1.458 1.458h-8.075l-2.978 2.978a1.215 1.215 0 0 1-2.072-.858v-2.12h-1.459a1.46 1.46 0 0 1-1.458-1.458V58.542Z"
                  clip-rule="evenodd"
                />
              </g>
              <g
                fill="#40BBFF"
                clip-path="url(#l)"
              >
                <rect
                  width="144"
                  height="37"
                  x="129"
                  y="47"
                  fill-opacity=".1"
                  rx="4"
                />
                <path
                  fill-rule="evenodd"
                  d="M139.707 58.334a.208.208 0 0 0-.208.208V68.96c0 .115.093.208.208.208h2.084a.624.624 0 0 1 .625.625v2.659l3.1-3.1a.625.625 0 0 1 .442-.184h8.333a.208.208 0 0 0 .208-.208V58.542a.209.209 0 0 0-.208-.208h-14.584Zm-1.458.208c0-.805.653-1.458 1.458-1.458h14.584c.805 0 1.458.653 1.458 1.458V68.96a1.456 1.456 0 0 1-1.458 1.458h-8.075l-2.978 2.978a1.215 1.215 0 0 1-2.072-.858v-2.12h-1.459a1.46 1.46 0 0 1-1.458-1.458V58.542Z"
                  clip-rule="evenodd"
                />
                <rect
                  width="96"
                  height="5"
                  x="167"
                  y="57"
                  fill-opacity=".5"
                  rx="2"
                />
                <rect
                  width="62"
                  height="5"
                  x="167"
                  y="68"
                  fill-opacity=".5"
                  rx="2"
                />
              </g>
              <g clip-path="url(#m)">
                <rect
                  width="144"
                  height="37"
                  x="258"
                  y="92"
                  fill="url(#n)"
                  fill-opacity=".1"
                  rx="4"
                />
                <path
                  fill="url(#o)"
                  fill-opacity=".5"
                  fill-rule="evenodd"
                  d="M298 102a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h92a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2h-92Zm0 11a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h58a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2h-58Z"
                  clip-rule="evenodd"
                />
                <path
                  fill="#40BBFF"
                  fill-opacity=".5"
                  fill-rule="evenodd"
                  d="M268.707 103.334a.208.208 0 0 0-.208.208v10.417c0 .115.093.208.208.208h2.084a.625.625 0 0 1 .625.625v2.659l3.1-3.1a.622.622 0 0 1 .442-.184h8.333a.208.208 0 0 0 .208-.208v-10.417a.208.208 0 0 0-.208-.208h-14.584Zm-1.458.208c0-.805.653-1.458 1.458-1.458h14.584c.805 0 1.458.653 1.458 1.458v10.417a1.454 1.454 0 0 1-1.458 1.458h-8.075l-2.978 2.978a1.214 1.214 0 0 1-2.072-.859v-2.119h-1.459a1.458 1.458 0 0 1-1.458-1.458v-10.417Z"
                  clip-rule="evenodd"
                />
              </g>
              <g clip-path="url(#p)">
                <rect
                  width="144"
                  height="37"
                  x="108"
                  y="92"
                  fill="url(#q)"
                  fill-opacity=".1"
                  rx="4"
                />
                <path
                  fill="#40BBFF"
                  fill-rule="evenodd"
                  d="M118.707 103.334a.208.208 0 0 0-.208.208v10.417c0 .115.093.208.208.208h2.084a.625.625 0 0 1 .625.625v2.659l3.1-3.1a.622.622 0 0 1 .442-.184h8.333a.208.208 0 0 0 .208-.208v-10.417a.208.208 0 0 0-.208-.208h-14.584Zm-1.458.208c0-.805.653-1.458 1.458-1.458h14.584c.805 0 1.458.653 1.458 1.458v10.417a1.454 1.454 0 0 1-1.458 1.458h-8.075l-2.978 2.978a1.214 1.214 0 0 1-2.072-.859v-2.119h-1.459a1.458 1.458 0 0 1-1.458-1.458v-10.417Z"
                  clip-rule="evenodd"
                />
                <path
                  fill="url(#r)"
                  fill-opacity=".5"
                  fill-rule="evenodd"
                  d="M148 102a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h92a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2h-92Zm0 11a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h58a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2h-58Z"
                  clip-rule="evenodd"
                />
              </g>
              <g clip-path="url(#s)">
                <rect
                  width="144"
                  height="37"
                  x="-48"
                  y="2"
                  fill="url(#t)"
                  fill-opacity=".1"
                  rx="4"
                />
                <path
                  fill="url(#u)"
                  fill-opacity=".5"
                  fill-rule="evenodd"
                  d="M-8 12a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h92a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2H-8Zm0 11a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h58a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2H-8Z"
                  clip-rule="evenodd"
                />
              </g>
              <g clip-path="url(#v)">
                <rect
                  width="144"
                  height="37"
                  x="-23"
                  y="47"
                  fill="url(#w)"
                  fill-opacity=".1"
                  rx="4"
                />
                <path
                  fill="url(#x)"
                  fill-opacity=".5"
                  fill-rule="evenodd"
                  d="M17 57a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h92a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2H17Zm0 11a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h58a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2H17Z"
                  clip-rule="evenodd"
                />
              </g>
              <g clip-path="url(#y)">
                <rect
                  width="144"
                  height="37"
                  x="-44"
                  y="92"
                  fill="url(#z)"
                  fill-opacity=".1"
                  rx="4"
                />
                <path
                  fill="url(#A)"
                  fill-opacity=".5"
                  fill-rule="evenodd"
                  d="M-4 102a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h92a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2H-4Zm0 11a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h58a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2H-4Z"
                  clip-rule="evenodd"
                />
              </g>
            </g>
          </g>
        </g>
        <defs>
          <linearGradient
            id="c"
            x1="-95.982"
            x2="154.726"
            y1="-44.5"
            y2="289.244"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#40BBFF" />
            <stop
              offset="1"
              stop-color="#40BBFF"
              stop-opacity="0"
            />
          </linearGradient>
          <linearGradient
            id="f"
            x1="256"
            x2="374"
            y1="16.5"
            y2="18"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              offset=".234"
              stop-color="#40BBFF"
            />
            <stop
              offset="1"
              stop-color="#40BBFF"
              stop-opacity="0"
            />
          </linearGradient>
          <linearGradient
            id="g"
            x1="293.5"
            x2="371"
            y1="22"
            y2="36.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#40BBFF" />
            <stop
              offset=".879"
              stop-color="#40BBFF"
              stop-opacity="0"
            />
            <stop
              offset="1"
              stop-color="#40BBFF"
              stop-opacity="0"
            />
          </linearGradient>
          <linearGradient
            id="j"
            x1="282.5"
            x2="345"
            y1="67.5"
            y2="66"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#40BBFF" />
            <stop
              offset="1"
              stop-color="#40BBFF"
              stop-opacity="0"
            />
          </linearGradient>
          <linearGradient
            id="k"
            x1="316.5"
            x2="373"
            y1="67"
            y2="73"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#40BBFF" />
            <stop
              offset="1"
              stop-color="#40BBFF"
              stop-opacity="0"
            />
          </linearGradient>
          <linearGradient
            id="n"
            x1="317"
            x2="320.5"
            y1="89"
            y2="123"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#40BBFF" />
            <stop
              offset="1"
              stop-color="#40BBFF"
              stop-opacity="0"
            />
          </linearGradient>
          <linearGradient
            id="o"
            x1="295.5"
            x2="373"
            y1="112"
            y2="126.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#40BBFF" />
            <stop
              offset=".879"
              stop-color="#40BBFF"
              stop-opacity="0"
            />
            <stop
              offset="1"
              stop-color="#40BBFF"
              stop-opacity="0"
            />
          </linearGradient>
          <linearGradient
            id="q"
            x1="180"
            x2="180"
            y1="92"
            y2="129"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#40BBFF" />
            <stop
              offset="1"
              stop-color="#40BBFF"
              stop-opacity="0"
            />
          </linearGradient>
          <linearGradient
            id="r"
            x1="194"
            x2="194"
            y1="102"
            y2="118"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#40BBFF" />
            <stop
              offset="1"
              stop-color="#40BBFF"
              stop-opacity="0"
            />
          </linearGradient>
          <linearGradient
            id="t"
            x1="98.5"
            x2="81"
            y1="25.5"
            y2="25.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#40BBFF" />
            <stop
              offset="1"
              stop-color="#40BBFF"
              stop-opacity="0"
            />
          </linearGradient>
          <linearGradient
            id="u"
            x1="90.5"
            x2="14.461"
            y1="21.6"
            y2="41.223"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#40BBFF" />
            <stop
              offset="1"
              stop-color="#40BBFF"
              stop-opacity="0"
            />
          </linearGradient>
          <linearGradient
            id="w"
            x1="123.5"
            x2="91.5"
            y1="70.5"
            y2="70.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#40BBFF" />
            <stop
              offset="1"
              stop-color="#40BBFF"
              stop-opacity="0"
            />
          </linearGradient>
          <linearGradient
            id="x"
            x1="115.5"
            x2="39.461"
            y1="66.6"
            y2="86.223"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#40BBFF" />
            <stop
              offset="1"
              stop-color="#40BBFF"
              stop-opacity="0"
            />
          </linearGradient>
          <linearGradient
            id="z"
            x1="102.5"
            x2="70.5"
            y1="115.5"
            y2="115.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#40BBFF" />
            <stop
              offset="1"
              stop-color="#40BBFF"
              stop-opacity="0"
            />
          </linearGradient>
          <linearGradient
            id="A"
            x1="94.5"
            x2="18.461"
            y1="111.6"
            y2="131.223"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#40BBFF" />
            <stop
              offset="1"
              stop-color="#40BBFF"
              stop-opacity="0"
            />
          </linearGradient>
          <clipPath id="b">
            <rect
              width="374"
              height="265"
              fill="#fff"
              rx="12"
            />
          </clipPath>
          <clipPath id="d">
            <path
              fill="#fff"
              d="M-48-43h471v172H-48z"
            />
          </clipPath>
          <clipPath id="e">
            <path
              fill="#fff"
              d="M256 2h144v37H256z"
            />
          </clipPath>
          <clipPath id="h">
            <path
              fill="#fff"
              d="M104 2h144v37H104z"
            />
          </clipPath>
          <clipPath id="i">
            <path
              fill="#fff"
              d="M279 47h144v37H279z"
            />
          </clipPath>
          <clipPath id="l">
            <path
              fill="#fff"
              d="M129 47h144v37H129z"
            />
          </clipPath>
          <clipPath id="m">
            <path
              fill="#fff"
              d="M258 92h144v37H258z"
            />
          </clipPath>
          <clipPath id="p">
            <path
              fill="#fff"
              d="M108 92h144v37H108z"
            />
          </clipPath>
          <clipPath id="s">
            <path
              fill="#fff"
              d="M-48 2H96v37H-48z"
            />
          </clipPath>
          <clipPath id="v">
            <path
              fill="#fff"
              d="M-23 47h144v37H-23z"
            />
          </clipPath>
          <clipPath id="y">
            <path
              fill="#fff"
              d="M-44 92h144v37H-44z"
            />
          </clipPath>
          <filter
            id="a"
            width="426"
            height="317"
            x="-26"
            y="-26"
            color-interpolation-filters="sRGB"
            filterUnits="userSpaceOnUse"
          >
            <feFlood
              flood-opacity="0"
              result="BackgroundImageFix"
            />
            <feGaussianBlur
              in="BackgroundImageFix"
              stdDeviation="13"
            />
            <feComposite
              in2="SourceAlpha"
              operator="in"
              result="effect1_backgroundBlur_186_15016"
            />
            <feBlend
              in="SourceGraphic"
              in2="effect1_backgroundBlur_186_15016"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    </div>
    <span class="text-5xl font-medium">{{ format(comments) }}</span>
    <span class="text-2xl">{{ comments === 1 ? 'Comment' : 'Comments' }}</span>
  </div>
</template>
