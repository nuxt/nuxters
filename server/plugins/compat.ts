import { getRequestHeader } from 'h3'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', async (event) => {
    if (typeof event.req.headers.get === 'undefined') {
      // @ts-expect-error support newer version of h3
      event.req.headers.get = getRequestHeader.bind(null, event)
    }
  })
})
