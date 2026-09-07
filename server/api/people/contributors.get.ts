export default defineEventHandler((event) => {
  const query = getQuery(event)
  const country = typeof query.country === 'string' ? query.country : ''
  const q = typeof query.q === 'string' ? query.q : ''
  const page = typeof query.page === 'string' ? Number(query.page) : 1
  if (country.length > 100 || q.length > 100 || !Number.isSafeInteger(page) || page < 1)
    throw createError({ statusCode: 400, statusMessage: 'Invalid people filters' })
  setResponseHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=300')
  return peopleDirectory.search({ country, q, page })
})
