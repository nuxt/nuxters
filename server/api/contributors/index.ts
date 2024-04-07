export default eventHandler(async (event) => {
    const contributors = await fetchContributors()
  
    return contributors
  })
  