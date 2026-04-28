import { getRequestHeader } from 'h3'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', async (event) => {
    if (typeof event.req.headers.get !== 'function') {
      // @ts-expect-error cross-version compat between h3 request header types
      event.req.headers.get = (name: string) => getRequestHeader(event, name) ?? null
    }
  })
})
