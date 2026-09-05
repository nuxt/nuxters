export interface PeopleCountry {
  id: string
  label: string
  location: readonly [latitude: number, longitude: number]
  count: number
  preview: string[]
}

export interface PeopleSummary {
  generatedAt: string
  totalContributors: number
  mappedContributors: number
  countries: PeopleCountry[]
}

export interface PeopleEntry {
  username: string
  countryId: string
  country: string
}

export interface PeopleResults {
  items: PeopleEntry[]
  total: number
  page: number
  pageSize: number
}
