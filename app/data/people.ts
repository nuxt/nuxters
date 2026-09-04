import contributorMeta from '../../public/contributors-meta.json'

export type PeopleLocationPrecision = 'city' | 'country'

export interface PeopleLocation {
  country: string
  id: string
  label: string
  location: readonly [latitude: number, longitude: number]
  people: readonly string[]
  precision: PeopleLocationPrecision
}

export interface PeopleMapResponse {
  generatedAt: string
  locations: readonly PeopleLocation[]
  mappedContributors: number
  publicProfiles: number
  totalContributors: number
  unresolvedProfiles: number
}

// Public GitHub profile locations from leading Nuxt contributors, reviewed on 2026-09-01.
// Coordinates are city or country centroids. They are intentionally not exact locations.
export const peopleLocations = [
  { country: 'France', id: 'bordeaux', label: 'Bordeaux', location: [44.8378, -0.5792], people: ['benjamincanac', 'clemcode', 'Flosciante'], precision: 'city' },
  { country: 'France', id: 'paris', label: 'Paris', location: [48.8566, 2.3522], people: ['larbish', 'Tahul', 'Barbapapazes'], precision: 'city' },
  { country: 'France', id: 'france', label: 'France', location: [46.2276, 2.2137], people: ['atinux', 'huang-julien'], precision: 'country' },
  { country: 'Netherlands', id: 'netherlands', label: 'Netherlands', location: [52.1326, 5.2913], people: ['pi0', 'pimlie'], precision: 'country' },
  { country: 'Netherlands', id: 'amsterdam', label: 'Amsterdam', location: [52.3676, 4.9041], people: ['TheAlexLichter'], precision: 'city' },
  { country: 'Netherlands', id: 'utrecht', label: 'Utrecht', location: [52.0907, 5.1214], people: ['BobbieGoede'], precision: 'city' },
  { country: 'United Kingdom', id: 'edinburgh', label: 'Edinburgh', location: [55.9533, -3.1883], people: ['danielroe'], precision: 'city' },
  { country: 'United Kingdom', id: 'london', label: 'London', location: [51.5072, -0.1276], people: ['HugoRCD'], precision: 'city' },
  { country: 'Australia', id: 'australia', label: 'Australia', location: [-25.2744, 133.7751], people: ['harlan-zw'], precision: 'country' },
  { country: 'Brazil', id: 'sao-jose-dos-campos', label: 'São José dos Campos', location: [-23.2237, -45.9009], people: ['ricardogobbosouza'], precision: 'city' },
  { country: 'Canada', id: 'edmonton', label: 'Edmonton', location: [53.5461, -113.4937], people: ['arashsheyda'], precision: 'city' },
  { country: 'Ireland', id: 'dublin', label: 'Dublin', location: [53.3498, -6.2603], people: ['clarkdo'], precision: 'city' },
  { country: 'Japan', id: 'osaka', label: 'Osaka', location: [34.6937, 135.5023], people: ['wattanx'], precision: 'city' },
  { country: 'Japan', id: 'tokyo', label: 'Tokyo', location: [35.6762, 139.6503], people: ['kazupon'], precision: 'city' },
  { country: 'Poland', id: 'poland', label: 'Poland', location: [51.9194, 19.1451], people: ['bdrtsky'], precision: 'country' },
  { country: 'Poland', id: 'wroclaw', label: 'Wrocław', location: [51.1079, 17.0385], people: ['Baroshem'], precision: 'city' },
  { country: 'Spain', id: 'palma', label: 'Palma de Mallorca', location: [39.5696, 2.6502], people: ['debs-obrien'], precision: 'city' },
  { country: 'Sweden', id: 'lund', label: 'Lund', location: [55.7047, 13.191], people: ['onmax'], precision: 'city' },
  { country: 'Switzerland', id: 'zurich', label: 'Zürich', location: [47.3769, 8.5417], people: ['lupas'], precision: 'city' },
  { country: 'France', id: 'nantes', label: 'Nantes', location: [47.2184, -1.5536], people: ['maximepvrt'], precision: 'city' },
  { country: 'France', id: 'rennes', label: 'Rennes', location: [48.1173, -1.6778], people: ['kevinmarrec'], precision: 'city' },
] as const satisfies readonly PeopleLocation[]

export const peopleMapFallback: PeopleMapResponse = {
  generatedAt: '2026-09-01T00:00:00.000Z',
  locations: peopleLocations,
  mappedContributors: peopleLocations.reduce((total, location) => total + location.people.length, 0),
  publicProfiles: peopleLocations.reduce((total, location) => total + location.people.length, 0),
  totalContributors: contributorMeta.count,
  unresolvedProfiles: 0,
}
