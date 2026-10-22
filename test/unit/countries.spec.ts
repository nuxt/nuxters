import { describe, expect, it } from 'vitest'
import { countryFromLocation, parseCountryIndex } from '../../scripts/utils/countries'

// The columns of GeoNames `countryInfo.txt` and `cities15000.txt` that the index reads.
const countryInfo = [
  '#ISO\tISO3\tISO-Numeric\tfips\tCountry',
  'FR\tFRA\t250\tFR\tFrance',
  'DE\tDEU\t276\tGM\tGermany',
  'ES\tESP\t724\tSP\tSpain',
  'US\tUSA\t840\tUS\tUnited States',
  'CA\tCAN\t124\tCA\tCanada',
  'AN\tANT\t530\tNT\tNetherlands Antilles',
].join('\n')

const city = (name: string, country: string, population: number, alternateNames = '', region = '') =>
  ['1', name, name, alternateNames, '0', '0', 'P', 'PPL', country, '', region, '', '', '', String(population)].join('\t')

const index = parseCountryIndex(countryInfo, [
  city('Paris', 'FR', 2_100_000),
  city('Paris', 'US', 25_000, '', 'TX'),
  city('San Francisco', 'US', 870_000, 'SF,CA', 'CA'),
  city('Toronto', 'CA', 2_700_000, '', '08'),
  city('Cambridge', 'GB', 145_000),
  city('Cambridge', 'US', 118_000, '', 'MA'),
  city('Montréal', 'CA', 1_700_000, 'Montreal'),
].join('\n'))

describe('countryFromLocation', () => {
  it.each([
    ['Lyon, France', 'FR'],
    ['Paris', 'FR'],
    ['San Francisco, CA', 'US'],
    ['Toronto, CA', 'CA'],
    ['Montreal', 'CA'],
    ['New York, USA', 'US'],
    ['London, UK', 'GB'],
    ['Paris, TX', 'US'],
    ['Cambridge, MA', 'US'],
    ['Cambridge', 'GB'],
    ['Deutschland', 'DE'],
    ['Madrid, España', 'ES'],
    ['Estados Unidos', 'US'],
  ])('%s → %s', (location, country) => {
    expect(countryFromLocation(location, index)).toBe(country)
  })

  it.each([null, '', 'Remote', 'localhost:3000', 'CA', 'SF', 'Netherlands Antilles'])('%s → null', (location) => {
    expect(countryFromLocation(location, index)).toBeNull()
  })
})
