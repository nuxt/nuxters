import { joinURL, withQuery } from 'ufo'
import { randomUUID } from 'uncrypto'

export default defineEventHandler(async (event) => {
  const provider = getRouterParam(event, 'provider')
  const { refresh } = getQuery(event)

  const config = useRuntimeConfig(event)
  const session = await getUserSession(event)
  const url = getRequestURL(event)

  if (provider === 'github' && (refresh || !session.data.githubId)) {
    const state = randomUUID()
    setCookie(event, 'state', state)

    return await sendRedirect(
      event,
      withQuery('https://github.com/login/oauth/authorize', {
        client_id: config.github.clientId,
        redirect_uri: joinURL(url.origin, 'oauth/github'),
        state,
      }),
    )
  }

  if (provider === 'discord' && (refresh || !session.data.discordId)) {
    const state = randomUUID()
    setCookie(event, 'state', state)

    return await sendRedirect(
      event,
      withQuery('https://discord.com/api/oauth2/authorize', {
        client_id: config.discord.clientId,
        redirect_uri: joinURL(url.origin, 'oauth/discord'),
        response_type: 'code',
        scope: 'identify guilds.join',
        state,
      }),
    )
  }

  await sendRedirect(event, '/')
})
