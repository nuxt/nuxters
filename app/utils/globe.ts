const GLOBE_RADIUS = 0.812

export interface GlobePointProjection {
  depth: number
  x: number
  y: number
}

export function globeMinimumDepth(containerWidth: number, scale: number): number {
  const projectedLimit = 0.8 - 28 / (containerWidth * scale)
  return Math.sqrt(Math.max(0, GLOBE_RADIUS ** 2 - projectedLimit ** 2))
}

export function projectGlobePoint(
  projection: GlobePointProjection,
  [latitude, longitude]: readonly [number, number],
  sinPhi: number,
  cosPhi: number,
  sinTheta: number,
  cosTheta: number,
  scale: number,
): void {
  const latitudeRadians = latitude * Math.PI / 180
  const longitudeRadians = longitude * Math.PI / 180 - Math.PI
  const cosLatitude = Math.cos(latitudeRadians)
  const x = -cosLatitude * Math.cos(longitudeRadians) * GLOBE_RADIUS
  const y = Math.sin(latitudeRadians) * GLOBE_RADIUS
  const z = cosLatitude * Math.sin(longitudeRadians) * GLOBE_RADIUS

  projection.depth = -sinPhi * cosTheta * x + sinTheta * y + cosPhi * cosTheta * z
  projection.x = (cosPhi * x + sinPhi * z) * scale
  projection.y = -(sinPhi * sinTheta * x + cosTheta * y - cosPhi * sinTheta * z) * scale
}
