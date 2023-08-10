export default eventHandler(async (event) => {
  const username = getRouterParam(event, 'username')
  if (!username) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username missing',
    })
  }
  const contributors = await fetchContributors()

  const contributor = contributors.find((contributor) => contributor.username.toLowerCase() === username.toLocaleLowerCase())

  if (!contributor) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Contributor not found',
    })
  }
  return contributor
})
