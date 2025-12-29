export default eventHandler(async (event) => {
  const url = getRequestURL(event)
  return fetch(`${url.origin}/contributors.json`).then(res => res.json())
})
