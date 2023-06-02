import { joinURL, withQuery } from 'ufo'
import { randomUUID } from 'uncrypto'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()

  const session = await getUserSession(event)

  if (!session.data.githubId) {
    const state = randomUUID()
    await setUserSession(event, { ...session.data, state })

    return await sendRedirect(
      event,
      withQuery('https://github.com/login/oauth/authorize', {
        client_id: config.github.clientId,
        redirect_uri: joinURL(config.url, 'oauth/github'),
        state,
      })
    )
  }

  const contributors = await fetchContributors()
  const contributions =
    contributors.find(contributor => contributor.node_id === session.data.githubId)?.contributions || 0

  await setUserSession(event, {
    ...session.data,
    contributions,
  })

  if (!session.data.discordId) {
    const state = randomUUID()
    await setUserSession(event, { ...session.data, state })

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

  return session.data
})
