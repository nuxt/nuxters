export default eventHandler(async (event) => {
  const contributors = await fetchContributors(event)

  return contributors
})
