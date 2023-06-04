import { joinURL, withQuery } from 'ufo'
import { randomUUID } from 'uncrypto'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()

  const session = await getUserSession(event)

  if (!session.data.discordId) {
    const state = randomUUID()
    setCookie(event, 'state', state)

    return await sendRedirect(
      event,
      withQuery('https://discord.com/api/oauth2/authorize', {
        client_id: config.discord.clientId,
        redirect_uri: joinURL(config.url, 'oauth/discord'),
        response_type: 'code',
        scope: 'identify',
        state,
      })
    )
  }

  await sendRedirect(event, '/')
})
