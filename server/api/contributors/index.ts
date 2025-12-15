export default eventHandler(async (event) => {
  const url = getRequestURL(event)
  return fetch(`${url.protocol}//${url.host}/contributors.json`)
})
