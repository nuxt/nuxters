export default eventHandler(async () => {
  const contributors = await fetchContributors()

  return contributors
})
