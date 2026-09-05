<script setup lang="ts">
import type { PeopleCountry } from '#shared/people'
import type { Globe } from 'cobe'
import createGlobe from 'cobe'
import { projectGlobePoint } from '~/utils/globe'

const props = withDefaults(defineProps<{
  countries: readonly PeopleCountry[]
  mode?: 'preview' | 'explore'
  selectedId?: string
}>(), { mode: 'preview' })
const emit = defineEmits<{ select: [country: string] }>()
const container = useTemplateRef('container')
const canvas = useTemplateRef('canvas')
const failed = ref(false)
const ready = ref(false)
const exploring = computed(() => props.mode === 'explore')
// Only serializable camera preferences belong in Nuxt state. WebGL, DOM and
// frame-by-frame interpolation stay local to this mounted canvas.
const camera = useState(`people:camera:${props.mode}`, () => ({ phi: 0, theta: 0.16, zoom: 1 }))
const rotationPaused = useState('people:preview-paused', () => false)
const zoom = ref(camera.value.zoom)
const markerElements = new Map<string, HTMLElement>()
const markerCountries = computed(() => {
  const sorted = [...props.countries].sort((a, b) => Number(b.id === props.selectedId) - Number(a.id === props.selectedId) || b.count - a.count)
  return exploring.value ? sorted : sorted.slice(0, 64)
})
let globe: Globe | undefined
let frame = 0
let width = 1
let height = 1
let resized = true
let visible = false
let hovering = false
let disposed = false
let previousTime = 0
let phi = camera.value.phi
let theta = camera.value.theta
let currentZoom = camera.value.zoom
let sizeObserver: ResizeObserver | undefined
let visibilityObserver: IntersectionObserver | undefined
let reducedMotion: MediaQueryList | undefined
const pointers = new Map<number, { x: number, y: number }>()
let pinchDistance = 0
const projection = { depth: 0, x: 0, y: 0 }

function markerRef(id: string, element: unknown) {
  if (element instanceof HTMLElement)
    markerElements.set(id, element)
  else
    markerElements.delete(id)
}
function clamp(value: number, low: number, high: number) {
  return Math.min(high, Math.max(low, value))
}
function angleDelta(from: number, to: number) {
  return ((to - from + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI
}
function schedule() {
  if (!frame && globe && visible && !document.hidden && !disposed) {
    previousTime = performance.now()
    frame = requestAnimationFrame(render)
  }
}
function stop() {
  cancelAnimationFrame(frame)
  frame = 0
}
function render(now: number) {
  frame = 0
  const elapsed = Math.min(now - previousTime, 64)
  previousTime = now
  const rotating = !exploring.value && !rotationPaused.value && !hovering && !reducedMotion?.matches
  if (rotating)
    camera.value.phi += elapsed * 0.00006
  const progress = reducedMotion?.matches || pointers.size ? 1 : 1 - Math.exp(-elapsed / 110)
  phi += angleDelta(phi, camera.value.phi) * progress
  theta += (camera.value.theta - theta) * progress
  currentZoom += (camera.value.zoom - currentZoom) * progress
  const scale = Math.min(width, height) / height * 0.98 * currentZoom
  globe?.update({ phi, theta, scale, ...(resized ? { width, height } : {}) })
  resized = false
  const sinPhi = Math.sin(phi)
  const cosPhi = Math.cos(phi)
  const sinTheta = Math.sin(theta)
  const cosTheta = Math.cos(theta)
  const occupied: Array<{ x: number, y: number, width: number }> = []
  for (const country of markerCountries.value) {
    const element = markerElements.get(country.id)
    if (!element)
      continue
    projectGlobePoint(projection, country.location, sinPhi, cosPhi, sinTheta, cosTheta, scale)
    const x = width / 2 + projection.x * height / 2
    const y = height / 2 + projection.y * height / 2
    const markerWidth = exploring.value ? 26 + String(country.count).length * 7 : 30
    const wasVisible = element.dataset.visible === 'true'
    const front = projection.depth > (wasVisible ? 0.10 : 0.14)
    const fits = x > markerWidth / 2 && x < width - markerWidth / 2 && y > 20 && y < height - 20
    const gap = wasVisible ? 4 : 8
    const hasRoom = occupied.every(other => Math.abs(other.x - x) > (other.width + markerWidth) / 2 + gap || Math.abs(other.y - y) > 28 + gap)
    const show = front && fits && hasRoom
    if (show !== wasVisible) {
      element.dataset.visible = String(show)
      element.inert = !show
    }
    // Keep positions tied to the globe; CSS only interpolates visibility.
    if (show || wasVisible) {
      const transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0) translate(-50%, -50%)`
      if (element.style.transform !== transform)
        element.style.transform = transform
    }
    if (show)
      occupied.push({ x, y, width: markerWidth })
  }
  if (container.value)
    container.value.dataset.rotation = phi.toFixed(4)
  const moving = Math.abs(angleDelta(phi, camera.value.phi)) > 0.0001 || Math.abs(theta - camera.value.theta) > 0.0001 || Math.abs(currentZoom - camera.value.zoom) > 0.0001
  if (rotating || moving)
    frame = requestAnimationFrame(render)
}
function setZoom(value: number) {
  zoom.value = clamp(value, 1, 3)
  camera.value = { ...camera.value, zoom: zoom.value }
  schedule()
}
function reset() {
  camera.value = { phi: 0, theta: 0.16, zoom: 1 }
  zoom.value = 1
  emit('select', '')
  schedule()
}
function focusCountry() {
  const country = props.countries.find(country => country.id === props.selectedId)
  if (!country)
    return
  const [latitude, longitude] = country.location
  camera.value = { phi: Math.PI - (longitude * Math.PI / 180 - Math.PI / 2), theta: clamp(latitude * Math.PI / 180, -1.45, 1.45), zoom: 1.8 }
  zoom.value = 1.8
  schedule()
}
function distance() {
  const [first, second] = [...pointers.values()]
  return first && second ? Math.hypot(first.x - second.x, first.y - second.y) : 0
}
function pointerDown(event: PointerEvent) {
  if (!exploring.value)
    return
  canvas.value?.setPointerCapture(event.pointerId)
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  pinchDistance = distance()
}
function pointerMove(event: PointerEvent) {
  const previous = pointers.get(event.pointerId)
  if (!previous)
    return
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  if (pointers.size > 1) {
    const next = distance()
    if (pinchDistance > 0)
      setZoom(camera.value.zoom * next / pinchDistance)
    pinchDistance = next
  }
  else {
    camera.value = {
      ...camera.value,
      phi: camera.value.phi + (event.clientX - previous.x) / 180,
      theta: clamp(camera.value.theta + (event.clientY - previous.y) / 240, -1.45, 1.45),
    }
    schedule()
  }
}
function pointerEnd(event: PointerEvent) {
  pointers.delete(event.pointerId)
  if (canvas.value?.hasPointerCapture(event.pointerId))
    canvas.value.releasePointerCapture(event.pointerId)
  pinchDistance = distance()
}
function keydown(event: KeyboardEvent) {
  if (!exploring.value)
    return
  const moves: Record<string, [number, number]> = { ArrowLeft: [-0.15, 0], ArrowRight: [0.15, 0], ArrowUp: [0, -0.15], ArrowDown: [0, 0.15] }
  const move = moves[event.key]
  if (move) {
    event.preventDefault()
    camera.value = { ...camera.value, phi: camera.value.phi + move[0], theta: clamp(camera.value.theta + move[1], -1.45, 1.45) }
    schedule()
  }
  else if (['+', '=', '-', '0'].includes(event.key)) {
    event.preventDefault()
    if (event.key === '0') reset()
    else setZoom(zoom.value + (event.key === '-' ? -0.25 : 0.25))
  }
}
function hover(value: boolean) {
  hovering = value
  schedule()
}
function contextLost() {
  failed.value = true
  stop()
}
function documentVisibility() {
  if (document.hidden) {
    pointers.clear()
    stop()
  }
  else schedule()
}
watch([markerCountries, rotationPaused], schedule, { flush: 'post' })
watch(() => props.selectedId, focusCountry)

onMounted(() => {
  if (!canvas.value || !container.value)
    return
  reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
  try {
    if (!canvas.value.getContext('webgl'))
      throw new Error('WebGL unavailable')
    globe = createGlobe(canvas.value, {
      width: 1, height: 1, devicePixelRatio: Math.min(devicePixelRatio || 1, innerWidth < 768 ? 1.5 : 2),
      phi, theta, scale: 0.98, dark: 0.85, diffuse: 1.2, mapSamples: 12000,
      mapBrightness: 3.5, mapBaseBrightness: 0.04, baseColor: [0.24, 0.4, 0.45],
      markerColor: [0, 0.86, 0.51], glowColor: [0.015, 0.035, 0.04], markers: [],
    })
  }
  catch {
    failed.value = true
    return
  }
  sizeObserver = new ResizeObserver(([entry]) => {
    if (!entry) return
    width = Math.max(1, Math.round(entry.contentRect.width))
    height = Math.max(1, Math.round(entry.contentRect.height))
    resized = true
    schedule()
  })
  sizeObserver.observe(container.value)
  visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false
    if (visible) schedule()
    else stop()
  })
  visibilityObserver.observe(container.value)
  document.addEventListener('visibilitychange', documentVisibility)
  reducedMotion.addEventListener('change', schedule)
  ready.value = true
  focusCountry()
})
onBeforeUnmount(() => {
  disposed = true
  stop()
  sizeObserver?.disconnect()
  visibilityObserver?.disconnect()
  document.removeEventListener('visibilitychange', documentVisibility)
  reducedMotion?.removeEventListener('change', schedule)
  globe?.destroy()
  markerElements.clear()
})
</script>

<template>
  <div
    ref="container"
    class="people-globe"
    :class="{ 'people-globe--preview': !exploring }"
    :data-ready="ready || undefined"
    :data-zoom="zoom"
    @pointerenter="hover(true)"
    @pointerleave="hover(false)"
  >
    <canvas
      v-show="!failed"
      ref="canvas"
      class="people-globe__canvas"
      :class="{ 'people-globe__canvas--interactive': exploring }"
      :tabindex="exploring ? 0 : undefined"
      role="img"
      :aria-label="exploring ? 'Community globe. Use arrow keys to rotate, plus and minus to zoom, and zero to reset. Countries are also available in the contributor panel.' : 'Nuxt contributors around the world'"
      @pointerdown="pointerDown"
      @pointermove="pointerMove"
      @pointerup="pointerEnd"
      @pointercancel="pointerEnd"
      @lostpointercapture="pointerEnd"
      @keydown="keydown"
      @webglcontextlost.prevent="contextLost"
    />
    <template v-if="ready && !failed">
      <button
        v-for="country in markerCountries"
        :key="country.id"
        :ref="element => markerRef(country.id, element)"
        data-visible="false"
        inert
        type="button"
        class="people-globe__marker"
        :class="{ 'is-selected': selectedId === country.id, 'is-avatar': !exploring }"
        :data-country="country.id"
        :title="`${country.label} · ${country.count.toLocaleString('en-US')}`"
        :aria-label="`${country.label}, ${country.count.toLocaleString('en-US')} ${country.count === 1 ? 'contributor' : 'contributors'}`"
        :aria-pressed="exploring ? selectedId === country.id : undefined"
        @click="emit('select', country.id)"
      >
        <template v-if="exploring">
          <span class="people-globe__dot" />{{ country.count.toLocaleString('en-US') }}
        </template>
        <NuxtImg
          v-else
          :src="country.preview[0]"
          width="32"
          height="32"
          alt=""
          loading="lazy"
        />
      </button>
    </template>
    <p
      v-if="failed"
      class="people-globe__fallback"
      role="status"
    >
      The globe is unavailable on this device. You can still explore contributors in the list.
    </p>
    <div
      v-if="exploring && !failed"
      class="people-globe__controls"
      role="group"
      aria-label="Globe controls"
    >
      <UButton
        icon="i-lucide-plus"
        aria-label="Zoom in"
        color="neutral"
        variant="ghost"
        :disabled="zoom >= 3"
        @click="setZoom(zoom + 0.25)"
      />
      <UButton
        icon="i-lucide-minus"
        aria-label="Zoom out"
        color="neutral"
        variant="ghost"
        :disabled="zoom <= 1"
        @click="setZoom(zoom - 0.25)"
      />
      <UButton
        icon="i-lucide-rotate-ccw"
        aria-label="Reset world view"
        color="neutral"
        variant="ghost"
        @click="reset"
      />
    </div>
    <UButton
      v-if="!exploring && ready && !failed"
      class="people-globe__pause"
      :icon="rotationPaused ? 'i-lucide-play' : 'i-lucide-pause'"
      :aria-label="rotationPaused ? 'Resume globe rotation' : 'Pause globe rotation'"
      color="neutral"
      variant="ghost"
      size="xs"
      @click="rotationPaused = !rotationPaused"
    />
  </div>
</template>

<style scoped>
.people-globe { position: relative; width: 100%; height: 100%; isolation: isolate; }
.people-globe--preview { aspect-ratio: 1; height: auto; border-radius: 50%; overflow: clip; }
.people-globe__canvas { display: block; width: 100%; height: 100%; }
.people-globe__canvas--interactive { cursor: grab; touch-action: none; }
.people-globe__canvas--interactive:active { cursor: grabbing; }
.people-globe__canvas:focus-visible { outline: 2px solid var(--ui-primary); outline-offset: -4px; }
.people-globe__marker { position: absolute; inset: 0 auto auto 0; display: flex; align-items: center; gap: 6px; min-width: 38px; height: 30px; padding: 0 9px; border: 1px solid #31554c; border-radius: 999px; background: #071b18; color: #d8f9ec; font: 600 11px/1 var(--font-sans); font-variant-numeric: tabular-nums; white-space: nowrap; }
.people-globe__marker { opacity: 0; visibility: hidden; pointer-events: none; transition: opacity 160ms ease-out, visibility 0s linear 160ms; }
.people-globe__marker[data-visible="true"] { opacity: 1; visibility: visible; pointer-events: auto; transition-delay: 0s; }
@media (prefers-reduced-motion: reduce) { .people-globe__marker { transition-duration: 80ms, 0s; transition-delay: 0s, 80ms; } .people-globe__marker[data-visible="true"] { transition-delay: 0s; } }
.people-globe__marker:hover, .people-globe__marker:focus-visible, .people-globe__marker.is-selected { border-color: var(--ui-primary); outline: 2px solid #00dc8255; outline-offset: 2px; z-index: 2; }
.people-globe__dot { width: 5px; height: 5px; border-radius: 50%; background: var(--ui-primary); }
.people-globe__marker.is-avatar { width: 30px; min-width: 0; height: 30px; padding: 0; overflow: hidden; }
.people-globe__marker img { width: 100%; height: 100%; object-fit: cover; }
.people-globe__controls { position: absolute; left: 24px; bottom: 24px; display: flex; border: 1px solid #ffffff20; border-radius: 12px; padding: 4px; background: #080e13ee; }
.people-globe__controls :deep(button) { width: 44px; height: 44px; justify-content: center; }
.people-globe__pause { position: absolute; left: 50%; bottom: 5%; transform: translateX(-50%); }
.people-globe__fallback { position: absolute; inset: 20%; display: grid; place-content: center; color: var(--ui-text-muted); text-align: center; font-size: 14px; }
@media (max-width: 767px) { .people-globe__controls { left: 16px; top: 16px; bottom: auto; } }
</style>
