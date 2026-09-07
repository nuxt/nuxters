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
