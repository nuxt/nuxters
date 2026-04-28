export default eventHandler(async (event) => {
  const url = getRequestURL(event)
  const origin = process.env.NUXT_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || url.origin
  return fetch(`${origin}/contributors.json`).then(res => res.json())
})
