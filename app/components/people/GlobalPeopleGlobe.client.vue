<script setup lang="ts">
import type { COBEOptions, Marker } from 'cobe'
import type { PeopleLocation } from '~/data/people'
import type { GlobePointProjection } from '~/utils/globe'
import { Cobe } from 'cobe-vue'
import { globeMinimumDepth, projectGlobePoint } from '~/utils/globe'

const props = defineProps<{
  compact?: boolean
  locations: readonly PeopleLocation[]
  selectedId?: string
  showAvatars?: boolean
}>()

const emit = defineEmits<{
  collapse: []
  reset: []
  selectContributor: [username: string]
}>()
const colorMode = useColorMode()

const MIN_SCALE = 0.74
const WORLD_SCALE = 0.9
const MAX_SCALE = 3.2
const ZOOM_STEP = 0.25
const AUTO_ROTATION_SPEED = 0.0014
const MAX_VERTICAL_ROTATION = Math.PI / 2 - 0.06
const MIN_AVATAR_CAPACITY = 64
const MAX_AVATAR_CAPACITY = 160
const container = ref<HTMLElement>()
const containerWidth = ref(640)
const pixelRatio = import.meta.client ? Math.min(window.devicePixelRatio, window.innerWidth <= 640 ? 1.5 : 2) : 1
const failed = ref(false)
const ready = ref(false)
const pointerOverGlobe = ref(false)
const zoomPercent = ref(0)
const viewLatitude = ref(Math.round(0.16 * 180 / Math.PI))
const avatarMarkers = new Map<string, HTMLElement>()
const avatarProjection: GlobePointProjection = { depth: 0, x: 0, y: 0 }

interface AvatarPoint {
  id: string
  location: readonly [number, number]
  locationId: string
  offsetX: number
  offsetY: number
  selected: boolean
  username: string
}

let animationFrame = 0
let lastFrameTime = 0
let intersectionObserver: IntersectionObserver | undefined
let isVisible = true
let resizeObserver: ResizeObserver | undefined
let reducedMotion: MediaQueryList | undefined
let phi = 0
let theta = 0.16
let scale = WORLD_SCALE
const renderPhi = ref(phi)
const renderTheta = ref(theta)
const renderScale = ref(scale)
let targetPhi = phi
let targetTheta = theta
let targetScale = scale
let pointerId: number | undefined
let pointerStartX = 0
let pointerStartY = 0
let pointerStartPhi = 0
let pointerStartTheta = 0
let pinchStartDistance = 0
let pinchStartScale = scale
const activePointers = new Map<number, { type: string, x: number, y: number }>()

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}

function shortestAngle(from: number, to: number): number {
  const fullTurn = Math.PI * 2
  return ((to - from + Math.PI) % fullTurn + fullTurn) % fullTurn - Math.PI
}

function pointerDistance(): number | undefined {
  const [first, second] = [...activePointers.values()]
  if (!first || !second)
    return undefined

  return Math.hypot(second.x - first.x, second.y - first.y)
}

function locationAngles([latitude, longitude]: readonly [number, number]): readonly [number, number] {
  return [Math.PI - (longitude * Math.PI / 180 - Math.PI / 2), latitude * Math.PI / 180]
}

function angularDistance(first: readonly [number, number], second: readonly [number, number]): number {
  const firstLatitude = first[0] * Math.PI / 180
  const secondLatitude = second[0] * Math.PI / 180
  const longitudeDelta = (first[1] - second[1]) * Math.PI / 180
  const cosine = Math.sin(firstLatitude) * Math.sin(secondLatitude)
    + Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.cos(longitudeDelta)

  return Math.acos(clamp(cosine, -1, 1)) * 180 / Math.PI
}

function hashUnit(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0) / 4294967295
}

function globeTheme(): Pick<COBEOptions, 'baseColor' | 'dark' | 'diffuse' | 'glowColor' | 'mapBaseBrightness' | 'mapBrightness' | 'markerColor'> {
  return colorMode.value === 'dark'
    ? {
        baseColor: [0.28, 0.5, 0.58],
        dark: 0.78,
        diffuse: 0.95,
        glowColor: [0.025, 0.065, 0.085],
        mapBaseBrightness: 0.06,
        mapBrightness: 3.6,
        markerColor: [0, 0.86, 0.51],
      }
    : {
        baseColor: [0.97, 0.99, 1],
        dark: 0.25,
        diffuse: 0.85,
        glowColor: [1, 1, 1],
        mapBaseBrightness: 0.03,
        mapBrightness: 1.45,
        markerColor: [0, 0.72, 0.43],
      }
}

const theme = computed(globeTheme)

const avatarDetailLevel = computed(() => {
  if (zoomPercent.value >= 80)
    return 3
  if (zoomPercent.value >= 55)
    return 2
  if (zoomPercent.value >= 25)
    return 1
  return 0
})

const avatarCapacity = computed(() => props.compact
  ? props.locations.length
  : clamp(Math.floor(containerWidth.value / 5), MIN_AVATAR_CAPACITY, MAX_AVATAR_CAPACITY))

const avatarPoints = computed<AvatarPoint[]>(() => {
  if (!props.showAvatars)
    return []

  const detail = avatarDetailLevel.value
  const capacity = avatarCapacity.value
  const perLocation = [2, 3, 5, 8][detail] ?? 2
  const spreadRadius = [22, 36, 64, 100][detail] ?? 22
  const minimumLocationSpacing = props.compact ? 0 : ([4, 3, 2, 0][detail] ?? 0)
  const ranked = props.locations.toSorted((a, b) => b.people.length - a.people.length || a.label.localeCompare(b.label))
  const selected = ranked.find(location => location.id === props.selectedId)
  const points: AvatarPoint[] = []
  const occupiedOffsets = new Map<string, Array<readonly [number, number]>>()

  function offsetFor(location: PeopleLocation, username: string, personIndex: number): readonly [number, number] {
    if (personIndex === 0 || spreadRadius === 0)
      return [0, 0]

    const occupied = occupiedOffsets.get(location.id) ?? [[0, 0] as const]
    const minimumDistance = detail >= 3 ? 20 : 18

    for (let attempt = 0; attempt < 16; attempt++) {
      const angle = hashUnit(`${username}:angle:${attempt}`) * Math.PI * 2
      const distance = spreadRadius * Math.sqrt(0.12 + hashUnit(`${username}:radius:${attempt}`) * 0.88)
      const candidate = [Math.cos(angle) * distance, Math.sin(angle) * distance] as const
      if (occupied.every(([x, y]) => Math.hypot(candidate[0] - x, candidate[1] - y) >= minimumDistance)) {
        occupied.push(candidate)
        occupiedOffsets.set(location.id, occupied)
        return candidate
      }
    }

    const angle = hashUnit(`${username}:fallback`) * Math.PI * 2
    return [Math.cos(angle) * spreadRadius, Math.sin(angle) * spreadRadius]
  }

  function add(location: PeopleLocation, personIndex: number): void {
    const username = location.people[personIndex]
    if (!username || points.length >= capacity)
      return

    const [offsetX, offsetY] = offsetFor(location, username, personIndex)
    points.push({
      id: `${location.id}-avatar-${personIndex}`,
      location: location.location,
      locationId: location.id,
      offsetX,
      offsetY,
      selected: location.id === props.selectedId,
      username,
    })
  }

  if (selected) {
    const selectedLimit = detail === 0
      ? 1
      : Math.min(selected.people.length, Math.floor(capacity * 0.45), [1, 12, 32, 72][detail] ?? 1)
    for (let personIndex = 0; personIndex < selectedLimit; personIndex++)
      add(selected, personIndex)
  }

  const candidates = ranked.filter(location => location.id !== selected?.id)
  const baseLocationLimit = Math.min(candidates.length, capacity - points.length, props.compact ? candidates.length : ([96, 104, 96, 72][detail] ?? 72))
  const visibleCandidates: PeopleLocation[] = []

  for (const location of candidates) {
    if (visibleCandidates.length >= baseLocationLimit)
      break
    if (visibleCandidates.every(candidate => angularDistance(location.location, candidate.location) >= minimumLocationSpacing))
      visibleCandidates.push(location)
  }

  for (const location of visibleCandidates)
    add(location, 0)

  for (let personIndex = 1; personIndex < perLocation && points.length < capacity; personIndex++) {
    for (const location of visibleCandidates) {
      add(location, personIndex)
      if (points.length >= capacity)
        break
    }
  }

  return points
})

function markers(): Marker[] {
  const avatarLocationIds = new Set(avatarPoints.value.map(point => point.locationId))
  return props.locations
    .filter(location => !avatarLocationIds.has(location.id))
    .map(location => ({
      location: [location.location[0], location.location[1]],
      size: clamp(0.003 + Math.log2(location.people.length + 1) * 0.0011, 0.003, 0.012),
    }))
}

const globeMarkers = computed(markers)

function setAvatarMarker(id: string, element: unknown): void {
  if (element instanceof HTMLElement)
    avatarMarkers.set(id, element)
  else
    avatarMarkers.delete(id)
}

function updateAvatarVisibility(): void {
  if (avatarMarkers.size !== avatarPoints.value.length && container.value) {
    for (const marker of container.value.querySelectorAll<HTMLElement>('[data-avatar-id]')) {
      if (marker.dataset.avatarId)
        avatarMarkers.set(marker.dataset.avatarId, marker)
    }
  }

  const cosTheta = Math.cos(theta)
  const cosPhi = Math.cos(phi)
  const sinTheta = Math.sin(theta)
  const sinPhi = Math.sin(phi)
  const minimumDepth = globeMinimumDepth(containerWidth.value, scale)
  const minimumAvatarSpacing = clamp(containerWidth.value * 0.055, 22, 30)
  const edgeFadeRadius = containerWidth.value * 0.44
  const visiblePositions: Array<readonly [number, number]> = []

  for (const point of avatarPoints.value) {
    const marker = avatarMarkers.get(point.id)
    if (!marker)
      continue

    projectGlobePoint(avatarProjection, point.location, sinPhi, cosPhi, sinTheta, cosTheta, scale)
    const screenX = Math.round(((avatarProjection.x + 1) * containerWidth.value / 2 + point.offsetX) * pixelRatio) / pixelRatio
    const screenY = Math.round(((avatarProjection.y + 1) * containerWidth.value / 2 + point.offsetY) * pixelRatio) / pixelRatio
    const wasVisible = marker.classList.contains('is-visible')
    const hasSpace = props.compact || point.selected || visiblePositions.every(([visibleX, visibleY]) => Math.hypot(screenX - visibleX, screenY - visibleY) >= minimumAvatarSpacing)
    const insideEdgeFade = Math.hypot(screenX - containerWidth.value / 2, screenY - containerWidth.value / 2) <= edgeFadeRadius
    const edgeThreshold = wasVisible ? minimumDepth - 0.02 : minimumDepth + 0.02
    const visible = avatarProjection.depth >= edgeThreshold && hasSpace && insideEdgeFade

    if (visible || wasVisible) {
      const translate = `calc(-50% + ${screenX}px) calc(-50% + ${screenY}px)`
      if (marker.style.translate !== translate)
        marker.style.translate = translate
    }
    if (visible && !props.compact)
      visiblePositions.push([screenX, screenY])
    marker.classList.toggle('is-visible', visible)
  }
}

function updateZoomPercent(): void {
  zoomPercent.value = Math.round((targetScale - MIN_SCALE) / (MAX_SCALE - MIN_SCALE) * 100)
}

function setZoom(next: number): void {
  targetScale = clamp(next, MIN_SCALE, MAX_SCALE)
  updateZoomPercent()
  scheduleAnimation()
}

function setVerticalRotation(next: number): void {
  targetTheta = clamp(next, -MAX_VERTICAL_ROTATION, MAX_VERTICAL_ROTATION)
  viewLatitude.value = Math.round(targetTheta * 180 / Math.PI)
  scheduleAnimation()
}

function zoomIn(): void {
  setZoom(targetScale + ZOOM_STEP)
}

function zoomOut(): void {
  setZoom(targetScale - ZOOM_STEP)
}

function resetView(): void {
  targetPhi = 0
  setVerticalRotation(0.16)
  setZoom(WORLD_SCALE)
  emit('reset')
}

function focusSelected(): void {
  const location = props.locations.find(candidate => candidate.id === props.selectedId)
  if (!location)
    return

  const [nextPhi, nextTheta] = locationAngles(location.location)
  targetPhi = nextPhi
  setVerticalRotation(nextTheta)
  setZoom(MAX_SCALE)
}

function onPointerDown(event: PointerEvent): void {
  const canvas = event.currentTarget as HTMLCanvasElement
  activePointers.set(event.pointerId, { type: event.pointerType, x: event.clientX, y: event.clientY })
  scheduleAnimation()

  if (activePointers.size === 1) {
    if (event.pointerType === 'touch')
      return

    canvas.setPointerCapture(event.pointerId)
    pointerId = event.pointerId
    pointerStartX = event.clientX
    pointerStartY = event.clientY
    pointerStartPhi = targetPhi
    pointerStartTheta = targetTheta
    return
  }

  if (activePointers.size === 2) {
    pinchStartDistance = pointerDistance() ?? 0
    pinchStartScale = targetScale
    pointerId = undefined
  }
}

function onPointerMove(event: PointerEvent): void {
  if (!activePointers.has(event.pointerId))
    return

  activePointers.set(event.pointerId, { type: event.pointerType, x: event.clientX, y: event.clientY })

  if (activePointers.size >= 2) {
    event.preventDefault()
    const distance = pointerDistance()
    if (distance !== undefined && pinchStartDistance > 0)
      setZoom(pinchStartScale * distance / pinchStartDistance)
    return
  }

  if (pointerId !== event.pointerId)
    return

  targetPhi = pointerStartPhi + (event.clientX - pointerStartX) / 150
  setVerticalRotation(
    pointerStartTheta + (event.clientY - pointerStartY) / 260,
  )
}

function onPointerEnd(event: PointerEvent): void {
  activePointers.delete(event.pointerId)
  const canvas = event.currentTarget as HTMLCanvasElement
  if (canvas.hasPointerCapture(event.pointerId))
    canvas.releasePointerCapture(event.pointerId)

  const remainingPointer = activePointers.entries().next().value as [number, { type: string, x: number, y: number }] | undefined
  if (!remainingPointer) {
    pointerId = undefined
    return
  }

  pointerId = remainingPointer[0]
  if (remainingPointer[1].type === 'touch') {
    pointerId = undefined
    return
  }
  pointerStartX = remainingPointer[1].x
  pointerStartY = remainingPointer[1].y
  pointerStartPhi = targetPhi
  pointerStartTheta = targetTheta
}

function resize(): void {
  if (!container.value)
    return

  containerWidth.value = Math.max(280, Math.round(container.value.getBoundingClientRect().width))
}

function pauseRotation(): void {
  pointerOverGlobe.value = true
  targetPhi = phi
}

function resumeRotation(): void {
  pointerOverGlobe.value = false
  scheduleAnimation()
}

function scheduleAnimation(): void {
  if (!animationFrame && isVisible && !document.hidden) {
    lastFrameTime = performance.now()
    animationFrame = requestAnimationFrame(animate)
  }
}

function onDocumentVisibilityChange(): void {
  if (document.hidden && animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = 0
  }
  else {
    scheduleAnimation()
  }
}

function animate(timestamp = performance.now()): void {
  animationFrame = 0
  const elapsed = lastFrameTime ? Math.min(timestamp - lastFrameTime, 250) : 16.67
  lastFrameTime = timestamp

  if (!pointerOverGlobe.value && activePointers.size === 0 && !props.selectedId && !reducedMotion?.matches)
    targetPhi += AUTO_ROTATION_SPEED * elapsed / 16.67

  const directManipulation = activePointers.size > 0
  const rotationProgress = directManipulation ? 1 : 1 - Math.exp(-elapsed / 180)
  const scaleProgress = directManipulation ? 1 : 1 - Math.exp(-elapsed / 120)
  phi += shortestAngle(phi, targetPhi) * rotationProgress
  theta += (targetTheta - theta) * rotationProgress
  scale += (targetScale - scale) * scaleProgress

  if (container.value)
    container.value.dataset.renderedLatitude = String(Math.round(theta * 180 / Math.PI))

  renderPhi.value = phi
  renderTheta.value = theta
  renderScale.value = scale
  updateAvatarVisibility()

  const moving = Math.abs(shortestAngle(phi, targetPhi)) > 0.0001
    || Math.abs(theta - targetTheta) > 0.0001
    || Math.abs(scale - targetScale) > 0.0001
  const autoRotating = !pointerOverGlobe.value && activePointers.size === 0 && !props.selectedId && !reducedMotion?.matches
  if (moving || autoRotating || activePointers.size > 0)
    scheduleAnimation()
}

watch([containerWidth, avatarPoints], scheduleAnimation, { flush: 'post' })

watch(() => props.selectedId, () => {
  if (props.selectedId)
    focusSelected()
})

onMounted(async () => {
  await nextTick()
  if (!container.value)
    return

  resize()
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  updateZoomPercent()
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container.value)
  intersectionObserver = new IntersectionObserver(([entry]) => {
    isVisible = entry?.isIntersecting ?? false
    if (isVisible)
      scheduleAnimation()
    else if (animationFrame) {
      cancelAnimationFrame(animationFrame)
      animationFrame = 0
    }
  })
  intersectionObserver.observe(container.value)
  document.addEventListener('visibilitychange', onDocumentVisibilityChange)
  reducedMotion.addEventListener('change', scheduleAnimation)

  ready.value = true
  updateAvatarVisibility()
  focusSelected()
  scheduleAnimation()
})

onErrorCaptured(() => {
  failed.value = true
  return false
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
  document.removeEventListener('visibilitychange', onDocumentVisibilityChange)
  intersectionObserver?.disconnect()
  reducedMotion?.removeEventListener('change', scheduleAnimation)
  resizeObserver?.disconnect()
})
</script>

<template>
  <div
    ref="container"
    class="people-globe"
    :class="{ 'people-globe--compact': compact }"
    :data-avatar-count="avatarPoints.length"
    :data-avatar-detail="avatarDetailLevel"
    :data-latitude="viewLatitude"
    :data-paused="pointerOverGlobe || undefined"
    :data-ready="ready || undefined"
    :data-rotation="renderPhi.toFixed(4)"
    :data-zoom="zoomPercent"
    @pointerenter="pauseRotation"
    @pointerleave="resumeRotation"
  >
    <div class="people-globe__viewport">
      <Cobe
        v-if="!failed"
        :width="containerWidth"
        :height="containerWidth"
        :device-pixel-ratio="pixelRatio"
        :phi="renderPhi"
        :theta="renderTheta"
        :scale="renderScale"
        :markers="globeMarkers"
        :base-color="theme.baseColor"
        :dark="theme.dark"
        :diffuse="theme.diffuse"
        :glow-color="theme.glowColor"
        :map-base-brightness="theme.mapBaseBrightness"
        :map-brightness="theme.mapBrightness"
        :marker-color="theme.markerColor"
        :map-samples="12_000"
        :marker-elevation="0.012"
        :opacity="1"
        class="people-globe__canvas"
        aria-hidden="true"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerEnd"
        @pointercancel="onPointerEnd"
      />

      <div
        v-else
        class="people-globe__fallback"
        role="status"
      >
        <UIcon
          name="i-lucide-globe-2"
          aria-hidden="true"
        />
        <p>The interactive globe is unavailable on this device.</p>
      </div>

      <template v-if="!failed">
        <button
          v-for="point in avatarPoints"
          :key="point.id"
          :ref="element => setAvatarMarker(point.id, element)"
          type="button"
          class="people-globe__avatar-marker"
          :class="{ 'is-selected': point.selected }"
          :data-avatar-id="point.id"
          :data-location-id="point.locationId"
          :aria-label="`Open ${point.username}'s Nuxter profile`"
          @click="emit('selectContributor', point.username)"
        >
          <NuxtImg
            :src="point.username"
            width="32"
            height="32"
            alt=""
            loading="lazy"
          />
        </button>
      </template>
    </div>

    <div
      v-if="!compact"
      class="people-globe__curtain"
      aria-hidden="true"
    />

    <div
      class="people-globe__controls"
      :class="{ 'people-globe__controls--compact': compact }"
      role="group"
      aria-label="Globe controls"
    >
      <UButton
        v-if="!compact"
        type="button"
        aria-label="Collapse map"
        title="Collapse map"
        icon="i-lucide-minimize-2"
        color="neutral"
        variant="ghost"
        size="sm"
        square
        class="rounded-none"
        @click="emit('collapse')"
      />
      <UButton
        type="button"
        aria-label="Zoom out"
        icon="i-lucide-minus"
        color="neutral"
        variant="ghost"
        size="sm"
        square
        class="rounded-none"
        :disabled="zoomPercent === 0"
        @click="zoomOut"
      />
      <UButton
        v-if="!compact"
        type="button"
        aria-label="Reset world view"
        icon="i-lucide-house"
        color="neutral"
        variant="ghost"
        size="sm"
        square
        class="rounded-none"
        @click="resetView"
      />
      <UButton
        type="button"
        aria-label="Zoom in"
        icon="i-lucide-plus"
        color="neutral"
        variant="ghost"
        size="sm"
        square
        class="rounded-none"
        :disabled="zoomPercent === 100"
        @click="zoomIn"
      />
    </div>

    <p
      class="sr-only"
      aria-live="polite"
    >
      Globe zoom is {{ zoomPercent }} percent.
    </p>
  </div>
</template>

<style scoped>
.people-globe {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  isolation: isolate;
  opacity: 0.45;
  transition: opacity 500ms ease;
}

.people-globe[data-ready] {
  opacity: 1;
}

.people-globe--compact {
  width: min(100%, 30rem);
}

.people-globe__viewport {
  position: absolute;
  inset: 0;
  overflow: clip;
  -webkit-mask-image: radial-gradient(circle, #000 72%, transparent 100%);
  mask-image: radial-gradient(circle, #000 72%, transparent 100%);
}

.people-globe__canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: grab;
  touch-action: pan-y;
  user-select: none;
}

.people-globe__canvas:active {
  cursor: grabbing;
}

.people-globe__avatar-marker {
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  width: clamp(1.25rem, 3.8vw, 1.65rem);
  height: clamp(1.25rem, 3.8vw, 1.65rem);
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--ui-primary) 55%, var(--ui-border));
  border-radius: 50%;
  background: var(--ui-bg);
  opacity: 0;
  cursor: pointer;
  pointer-events: none;
  transform: scale(0.76);
  transition: opacity 360ms cubic-bezier(0.23, 1, 0.32, 1), transform 360ms cubic-bezier(0.23, 1, 0.32, 1), visibility 0s linear 360ms;
  visibility: hidden;
  will-change: opacity, transform;
}

.people-globe__avatar-marker:hover,
.people-globe__avatar-marker:focus-visible {
  border-color: var(--ui-primary);
  outline: 2px solid color-mix(in srgb, var(--ui-primary) 55%, transparent);
  outline-offset: 2px;
  scale: 1.12;
}

.people-globe__avatar-marker.is-visible {
  opacity: 0.94;
  pointer-events: auto;
  transform: scale(1);
  transition-delay: 0s, 0s, 0s;
  transition-duration: 480ms, 520ms, 0s;
  transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1), cubic-bezier(0.34, 1.56, 0.64, 1), linear;
  visibility: visible;
}

.people-globe__avatar-marker.is-selected {
  z-index: 3;
  border-color: var(--ui-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--ui-primary) 20%, transparent), 0 2px 8px color-mix(in srgb, var(--ui-text-highlighted) 25%, transparent);
  scale: 1.06;
}

.people-globe__avatar-marker img {
  width: 100%;
  height: 100%;
  min-width: 0;
  object-fit: cover;
}

.people-globe__fallback {
  position: absolute;
  inset: 12%;
  display: grid;
  place-content: center;
  gap: 0.75rem;
  border: 1px solid var(--ui-border);
  border-radius: 50%;
  color: var(--ui-text-muted);
  text-align: center;
}

.people-globe__fallback :deep(svg) {
  width: 2rem;
  height: 2rem;
  margin-inline: auto;
}

.people-globe__controls {
  position: absolute;
  z-index: 3;
  top: 14%;
  right: 7%;
  display: grid;
  overflow: hidden;
  border: 1px solid var(--ui-border);
  background: color-mix(in srgb, var(--ui-bg) 90%, transparent);
  backdrop-filter: blur(0.75rem);
}

.people-globe__controls--compact {
  top: 8%;
  right: 8%;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-0.25rem) scale(0.96);
  transform-origin: top right;
  transition: opacity 160ms ease, transform 160ms cubic-bezier(0.23, 1, 0.32, 1);
}

@media (hover: hover) and (pointer: fine) {
  .people-globe--compact:hover .people-globe__controls--compact {
    opacity: 1;
    pointer-events: auto;
    transform: none;
  }
}

.people-globe--compact:focus-within .people-globe__controls--compact {
  opacity: 1;
  pointer-events: auto;
  transform: none;
}

.people-globe__curtain {
  position: absolute;
  z-index: 1;
  inset: 0;
  background: radial-gradient(ellipse 52% 115% at 100% 50%, var(--people-panel-bg, var(--ui-bg-elevated)) 0 18%, color-mix(in srgb, var(--people-panel-bg, var(--ui-bg-elevated)) 70%, transparent) 42%, transparent 72%);
  pointer-events: none;
}

.people-globe__controls :deep(button) {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  color: var(--ui-text-muted);
  transition: background 140ms ease, color 140ms ease;
}

.people-globe__controls :deep(button + button) {
  border-top: 1px solid var(--ui-border);
}

.people-globe__controls :deep(button:hover:not(:disabled)),
.people-globe__controls :deep(button:focus-visible) {
  background: var(--ui-bg-elevated);
  color: var(--ui-text-highlighted);
}

.people-globe__controls :deep(button:focus-visible) {
  outline: 2px solid var(--ui-primary);
  outline-offset: -2px;
}

.people-globe__controls :deep(button:disabled) {
  cursor: not-allowed;
  opacity: 0.35;
}

@media (max-width: 640px) {
  .people-globe__controls {
    top: 12%;
    right: 4%;
  }
}

@media (max-width: 900px) {
  .people-globe__curtain {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .people-globe {
    transition: none;
  }

  .people-globe__controls--compact {
    transition: none;
  }

  .people-globe__avatar-marker,
  .people-globe__avatar-marker.is-visible {
    transform: none;
    transition: opacity 140ms ease, visibility 0s linear 140ms;
  }

  .people-globe__avatar-marker.is-visible {
    transition-delay: 0s;
  }
}
</style>
