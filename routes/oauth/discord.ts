import { joinURL } from 'ufo'

export default defineEventHandler(async event => {
  const { state, code } = getQuery(event)
  if (!code || !state) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Missing authorisation code.',
    })
  }

  const session = await getUserSession(event)

  if (state !== session.data.state) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Potential cross-site request forgery detected.',
    })
  }

  const config = useRuntimeConfig()

  const { access_token } = await $fetch<{ access_token: string }>('https://discord.com/api/oauth2/token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: config.discord.clientId,
      client_secret: config.discord.clientSecret,
      grant_type: 'authorization_code',
      code: code as string,
      redirect_uri: joinURL(config.url, '/oauth/discord'),
    }).toString(),
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  })

  if (!access_token) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Authorisation code invalid.',
    })
  }

  const user = await $fetch<{ id: string }>('https://discord.com/api/users/@me', {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })

  await setUserSession(event, {
    ...session.data,
    discordId: user.id,
  })

  if (session.data.contributions > 0) {
    await $fetch(
      `https://discord.com/api/guilds/${config.discord.guildId}/members/${user.id}/roles/${config.discord.memberRoleId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bot ${config.discord.botToken}`,
        },
      }
    )
  }

  return await sendRedirect(event, '/')
})
