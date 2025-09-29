export default eventHandler(async (event) => {
  const username = getRouterParam(event, 'username')
  if (!username) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username missing',
    })
  }
  const contributors = await fetchContributors()

  const index = contributors?.findIndex(contributor => contributor.username.toLowerCase() === username.toLocaleLowerCase()) ?? -1

  if (index === -1) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Contributor not found',
    })
  }
  return {
    ...contributors![index]!,
    rank: index + 1,
  }
})
