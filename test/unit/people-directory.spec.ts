import { describe, expect, it } from 'vitest'
import { createPeopleDirectory } from '../../shared/utils/people'
import { parseProfileBatch } from '../../scripts/utils/github-profiles'

const directory = createPeopleDirectory({
  generatedAt: '2026-09-05', totalContributors: 100,
  locations: [
    { id: 'country-fr', country: 'France', location: [46, 2], people: Array.from({ length: 30 }, (_, i) => `person${String(i).padStart(2, '0')}`) },
    { id: 'country-es', country: 'Spain', location: [40, -3], people: ['onmax', 'PERSON00'] },
  ],
})

describe('people directory', () => {
  it('returns a small summary while keeping every contributor discoverable', () => {
    expect(directory.summary.mappedContributors).toBe(31)
    expect(directory.summary.countries[0]?.count).toBe(30)
    expect(directory.summary.countries[0]?.preview).toHaveLength(3)
    const first = directory.search({ country: 'country-fr' })
    const second = directory.search({ country: 'country-fr', page: 2 })
    expect(first.total).toBe(30)
    expect(first.items).toHaveLength(24)
    expect(second.items).toHaveLength(6)
    expect(new Set([...first.items, ...second.items].map(item => item.username)).size).toBe(30)
  })
  it('combines case-insensitive search with country filters and clamps pages', () => {
    expect(directory.search({ q: 'ONMAX' }).items[0]?.username).toBe('onmax')
    expect(directory.search({ country: 'country-fr', q: 'onmax' }).total).toBe(0)
    expect(directory.search({ q: 'france', page: 100 }).page).toBe(2)
    expect(directory.search({ country: 'missing' }).items).toEqual([])
  })
})

describe('GitHub profile collection', () => {
  it('accepts complete responses and explicitly identified deleted accounts', () => {
    const profile = { login: 'onmax', location: 'Spain' }
    expect(parseProfileBatch({ data: { u0: profile } }, ['onmax'])).toEqual([profile])
    expect(parseProfileBatch({ data: { u0: null }, errors: [{ type: 'NOT_FOUND', path: ['u0'], message: 'Deleted account' }] }, ['deleted'])).toEqual([])
  })
  it('rejects partial data, rate limits, and unidentified missing profiles', () => {
    expect(() => parseProfileBatch({ data: { u0: null } }, ['onmax'])).toThrow('incomplete profile')
    expect(() => parseProfileBatch({ data: {} }, ['onmax'])).toThrow('incomplete profile')
    expect(() => parseProfileBatch({ data: { u0: { login: 'onmax' } } }, ['onmax'])).toThrow('incomplete profile')
    expect(() => parseProfileBatch({ data: { u0: { login: 'onmax', location: null } }, errors: [{ type: 'RATE_LIMITED', message: 'Rate limit exceeded' }] }, ['onmax'])).toThrow('Incomplete GitHub profile batch')
    expect(() => parseProfileBatch({ data: { u0: null }, errors: [{ type: 'NOT_FOUND', path: ['u0', 'location'], message: 'Field failure' }] }, ['onmax'])).toThrow()
  })
})
