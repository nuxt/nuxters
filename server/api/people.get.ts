import type { PeopleMapResponse } from '~/data/people'
import peopleMap from '~~/public/people.json'

const response = peopleMap as unknown as PeopleMapResponse

export default defineCachedEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800')
  return response
}, {
  getKey: () => 'people-map',
  maxAge: 60 * 60 * 24,
  name: 'people-map',
  swr: true,
})
