export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=3600')
  return peopleDirectory.summary
})
