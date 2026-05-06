export default defineEventHandler(async (event) => {
  return fetchContributors(event)
})
