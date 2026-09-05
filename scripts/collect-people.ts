import type { PeopleLocation, PeopleMapResponse } from '../app/data/people'
import { readFile, rename, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { strFromU8, unzipSync } from 'fflate'
import type { GitHubProfile } from './utils/github-profiles'
import { parseProfileBatch } from './utils/github-profiles'

interface ContributorRecord {
  score: number
  username: string
}

interface Country {
  code: string
  name: string
}

interface City {
  countryCode: string
  id: string
  latitude: number
  longitude: number
  name: string
  population: number
}

interface GeoIndex {
  cities: Map<string, City[]>
  countries: Map<string, Country>
  countryCentroids: Map<string, readonly [number, number]>
}

const CONTRIBUTORS_FILE = resolve('public/contributors.json')
const OUTPUT_FILE = resolve(process.env.PEOPLE_OUTPUT_FILE || 'public/people.json')
const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql'
const GEONAMES_CITIES_URL = 'https://download.geonames.org/export/dump/cities15000.zip'
const GEONAMES_COUNTRIES_URL = 'https://download.geonames.org/export/dump/countryInfo.txt'
const BATCH_SIZE = 100
const PROFILE_CONCURRENCY = 4
const token = process.env.NUXT_GITHUB_TOKEN || process.env.GH_TOKEN
const requestedLimit = Number(process.env.PEOPLE_LIMIT || 0)

const countryAliases: Record<string, string> = {
  'america': 'US',
  'britain': 'GB',
  'england': 'GB',
  'holland': 'NL',
  'scotland': 'GB',
  'uae': 'AE',
  'uk': 'GB',
  'usa': 'US',
  'united states of america': 'US',
}

const ignoredLocations = new Set([
  '',
  'anywhere',
  'earth',
  'everywhere',
  'global',
  'internet',
  'milky way',
  'remote',
  'the internet',
  'world',
  'worldwide',
])

function normalize(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, { headers: { 'User-Agent': 'nuxters-location-collector' } })
  if (!response.ok)
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  return response.text()
}

async function loadGeoIndex(): Promise<GeoIndex> {
  console.log('Loading GeoNames city and country data')
  const [countryText, citiesResponse] = await Promise.all([
    fetchText(GEONAMES_COUNTRIES_URL),
    fetch(GEONAMES_CITIES_URL, { headers: { 'User-Agent': 'nuxters-location-collector' } }),
  ])
  if (!citiesResponse.ok)
    throw new Error(`Failed to fetch ${GEONAMES_CITIES_URL}: ${citiesResponse.status}`)

  const countries = new Map<string, Country>()
  for (const line of countryText.split('\n')) {
    if (!line || line.startsWith('#'))
      continue
    const fields = line.split('\t')
    const code = fields[0]
    const iso3 = fields[1]
    const name = fields[4]
    if (!code || !name)
      continue
    const country = { code, name }
    countries.set(normalize(code), country)
    if (iso3)
      countries.set(normalize(iso3), country)
    countries.set(normalize(name), country)
  }
  for (const [alias, code] of Object.entries(countryAliases)) {
    const country = countries.get(normalize(code))
    if (country)
      countries.set(alias, country)
  }

  const archive = unzipSync(new Uint8Array(await citiesResponse.arrayBuffer()))
  const cityFile = Object.entries(archive).find(([name]) => name.endsWith('.txt'))?.[1]
  if (!cityFile)
    throw new Error('GeoNames archive did not contain a city data file')

  const cities = new Map<string, City[]>()
  const countryVectors = new Map<string, { weight: number, x: number, y: number, z: number }>()
  for (const line of strFromU8(cityFile).split('\n')) {
    if (!line)
      continue
    const fields = line.split('\t')
    const id = fields[0]
    const name = fields[1]
    const asciiName = fields[2]
    const alternateNames = fields[3]
    const latitude = Number(fields[4])
    const longitude = Number(fields[5])
    const countryCode = fields[8]
    const population = Number(fields[14] || 0)
    if (!id || !name || !countryCode || !Number.isFinite(latitude) || !Number.isFinite(longitude))
      continue

    const city = { countryCode, id, latitude, longitude, name, population }
    const names = new Set([name, asciiName, ...(alternateNames?.split(',') || [])])
    for (const candidate of names) {
      const key = normalize(candidate || '')
      if (!key || key.length < 2)
        continue
      const entries = cities.get(key) || []
      entries.push(city)
      cities.set(key, entries)
    }

    const latitudeRadians = latitude * Math.PI / 180
    const longitudeRadians = longitude * Math.PI / 180
    const weight = Math.max(1, Math.log2(population + 2))
    const vector = countryVectors.get(countryCode) || { weight: 0, x: 0, y: 0, z: 0 }
    vector.weight += weight
    vector.x += Math.cos(latitudeRadians) * Math.cos(longitudeRadians) * weight
    vector.y += Math.cos(latitudeRadians) * Math.sin(longitudeRadians) * weight
    vector.z += Math.sin(latitudeRadians) * weight
    countryVectors.set(countryCode, vector)
  }

  const countryCentroids = new Map<string, readonly [number, number]>()
  for (const [code, vector] of countryVectors) {
    const longitude = Math.atan2(vector.y, vector.x) * 180 / Math.PI
    const hypotenuse = Math.sqrt(vector.x * vector.x + vector.y * vector.y)
    const latitude = Math.atan2(vector.z, hypotenuse) * 180 / Math.PI
    countryCentroids.set(code, [latitude, longitude])
  }
  return { cities, countries, countryCentroids }
}

function matchCountry(rawLocation: string, index: GeoIndex): Country | undefined {
  const normalizedLocation = normalize(rawLocation)
  const segments = rawLocation.split(/[,/|·•]|\s+-\s+/).map(normalize).filter(Boolean)
  for (const segment of [...segments].reverse()) {
    const country = index.countries.get(segment)
    if (country)
      return country
  }
  for (const [alias, country] of index.countries) {
    if (alias.length > 3 && (` ${normalizedLocation} `).includes(` ${alias} `))
      return country
  }
}

function matchCity(rawLocation: string, country: Country | undefined, index: GeoIndex): City | undefined {
  const normalizedLocation = normalize(rawLocation)
  const candidates = rawLocation.split(/[,/|·•]|\s+-\s+/).map(normalize).filter(Boolean)
  candidates.push(normalizedLocation)
  if (country) {
    for (const [alias, candidateCountry] of index.countries) {
      if (candidateCountry.code === country.code && normalizedLocation.endsWith(` ${alias}`))
        candidates.push(normalizedLocation.slice(0, -alias.length).trim())
    }
  }

  for (const candidate of candidates) {
    const matches = index.cities.get(candidate)
    if (!matches?.length)
      continue
    const countryMatches = country ? matches.filter(city => city.countryCode === country.code) : matches
    const pool = country ? countryMatches : matches
    if (!pool.length)
      continue
    return pool.toSorted((a, b) => b.population - a.population)[0]
  }
}

function resolveLocation(rawLocation: string, index: GeoIndex): Omit<PeopleLocation, 'people'> | undefined {
  const normalizedLocation = normalize(rawLocation)
  if (ignoredLocations.has(normalizedLocation))
    return

  const matchedCountry = matchCountry(rawLocation, index)
  const city = matchCity(rawLocation, matchedCountry, index)
  const country = matchedCountry ?? (city ? index.countries.get(normalize(city.countryCode)) : undefined)

  if (country) {
    const centroid = index.countryCentroids.get(country.code)
    if (!centroid)
      return
    return {
      country: country.name,
      id: `country-${country.code.toLowerCase()}`,
      label: country.name,
      location: [Number(centroid[0].toFixed(4)), Number(centroid[1].toFixed(4))],
      precision: 'country',
    }
  }
}

function buildQuery(usernames: string[]): string {
  const users = usernames
    .map((username, index) => `u${index}: user(login: ${JSON.stringify(username)}) { login location }`)
    .join('\n')
  return `query PeopleLocations { rateLimit { cost remaining resetAt } ${users} }`
}

async function fetchProfileBatch(usernames: string[], attempt = 1): Promise<GitHubProfile[]> {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'nuxters-location-collector',
    },
    body: JSON.stringify({ query: buildQuery(usernames) }),
  })
  if (!response.ok) {
    if (attempt < 4 && (response.status === 429 || response.status >= 500)) {
      await new Promise(resolve => setTimeout(resolve, attempt * 2000))
      return fetchProfileBatch(usernames, attempt + 1)
    }
    throw new Error(`GitHub GraphQL request failed: ${response.status} ${await response.text()}`)
  }

  return parseProfileBatch(await response.json(), usernames)
}

async function collectProfiles(contributors: ContributorRecord[]): Promise<GitHubProfile[]> {
  const batches = Array.from(
    { length: Math.ceil(contributors.length / BATCH_SIZE) },
    (_, index) => contributors.slice(index * BATCH_SIZE, (index + 1) * BATCH_SIZE),
  )
  const results: GitHubProfile[][] = Array.from({ length: batches.length })
  let nextBatch = 0
  let completed = 0

  async function worker(): Promise<void> {
    while (nextBatch < batches.length) {
      const index = nextBatch++
      const batch = batches[index]
      if (!batch)
        continue
      results[index] = await fetchProfileBatch(batch.map(contributor => contributor.username))
      completed += batch.length
      if (completed % 1000 === 0 || completed === contributors.length)
        console.log(`Fetched ${completed}/${contributors.length} GitHub profiles`)
    }
  }

  await Promise.all(Array.from({ length: PROFILE_CONCURRENCY }, () => worker()))
  return results.flat()
}

async function main(): Promise<void> {
  if (!token)
    throw new Error('NUXT_GITHUB_TOKEN or GH_TOKEN is required to collect public profile locations')

  const allContributors = JSON.parse(await readFile(CONTRIBUTORS_FILE, 'utf8')) as ContributorRecord[]
  const contributors = requestedLimit > 0 ? allContributors.slice(0, requestedLimit) : allContributors
  const [profiles, geoIndex] = await Promise.all([collectProfiles(contributors), loadGeoIndex()])
  const locations = new Map<string, { location: Omit<PeopleLocation, 'people'>, people: string[] }>()
  let publicProfiles = 0
  let unresolvedProfiles = 0

  for (const profile of profiles) {
    if (!profile.location)
      continue
    publicProfiles++
    const location = resolveLocation(profile.location, geoIndex)
    if (!location) {
      unresolvedProfiles++
      continue
    }
    const entry = locations.get(location.id) || { location, people: [] }
    entry.people.push(profile.login)
    locations.set(location.id, entry)
  }

  const resolvedLocations: PeopleLocation[] = Array.from(locations.values())
    .map(({ location, people }) => ({ ...location, people }))
    .toSorted((a, b) => b.people.length - a.people.length || a.label.localeCompare(b.label))
  const mappedContributors = resolvedLocations.reduce((total, location) => total + location.people.length, 0)
  const response: PeopleMapResponse = {
    generatedAt: new Date().toISOString(),
    locations: resolvedLocations,
    mappedContributors,
    publicProfiles,
    totalContributors: allContributors.length,
    unresolvedProfiles,
  }

  const temporaryFile = `${OUTPUT_FILE}.${process.pid}.tmp`
  await writeFile(temporaryFile, `${JSON.stringify(response, null, 2)}\n`, 'utf8')
  await rename(temporaryFile, OUTPUT_FILE)
  console.log(`Mapped ${mappedContributors}/${publicProfiles} public profiles across ${resolvedLocations.length} countries`)
  console.log(`Wrote ${OUTPUT_FILE}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
