import type { PeopleCountry, PeopleEntry, PeopleResults, PeopleSummary } from '../people'

interface PeopleSnapshot {
  generatedAt: string
  totalContributors: number
  locations: readonly {
    id: string
    country: string
    location: readonly number[]
    people: readonly string[]
  }[]
}

export function createPeopleDirectory(snapshot: PeopleSnapshot) {
  const countries = new Map<string, PeopleCountry>()
  const entries: PeopleEntry[] = []
  const seen = new Set<string>()
  for (const location of snapshot.locations) {
    const [latitude, longitude] = location.location
    if (latitude === undefined || longitude === undefined || !Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180)
      throw new Error(`Invalid country coordinates: ${location.id}`)
    const country = countries.get(location.id) ?? {
      id: location.id,
      label: location.country.replace(/^The\s+/, ''),
      location: [latitude, longitude] as const,
      count: 0,
      preview: [],
    }
    for (const username of location.people) {
      const key = username.toLowerCase()
      if (seen.has(key))
        continue
      seen.add(key)
      country.count++
      if (country.preview.length < 3)
        country.preview.push(username)
      entries.push({ username, countryId: country.id, country: country.label })
    }
    countries.set(country.id, country)
  }
  entries.sort((a, b) => a.username.toLowerCase().localeCompare(b.username.toLowerCase(), 'en'))
  const summary: PeopleSummary = {
    generatedAt: snapshot.generatedAt,
    totalContributors: snapshot.totalContributors,
    mappedContributors: entries.length,
    countries: [...countries.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'en')),
  }
  // Build the searchable strings once per server instance, not once per request.
  const searchable = entries.map(entry => ({ entry, text: `${entry.username} ${entry.country}`.toLowerCase() }))

  function search(options: { country?: string, q?: string, page?: number }): PeopleResults {
    const query = (options.q ?? '').trim().toLowerCase().slice(0, 100)
    const matches = searchable.filter(({ entry, text }) => (!options.country || entry.countryId === options.country) && (!query || text.includes(query)))
    const pageSize = 24
    const pages = Math.max(1, Math.ceil(matches.length / pageSize))
    const page = Math.min(pages, Math.max(1, Math.trunc(options.page || 1)))
    return {
      items: matches.slice((page - 1) * pageSize, page * pageSize).map(({ entry }) => entry),
      total: matches.length,
      page,
      pageSize,
    }
  }
  return { summary, search }
}
