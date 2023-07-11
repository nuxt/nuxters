import type { H3Event } from 'h3'

export function getUserSession(event: H3Event) {
  const config = useRuntimeConfig(event)
  return useSession(event, { password: config.sessionPassword })
}

export function setUserSession(event: H3Event, data: any) {
  const config = useRuntimeConfig(event)
  return updateSession(event, { password: config.sessionPassword }, data)
}

export function clearUserSession(event: H3Event) {
  const config = useRuntimeConfig(event)
  return clearSession(event, { password: config.sessionPassword })
}
