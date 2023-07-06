import { joinURL } from 'ufo'

export default defineEventHandler(async event => {
  const { state, code } = getQuery(event)
  if (!code || !state) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Missing authorisation code.',
    })
  }

  if (state !== getCookie(event, 'state')) {
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
      'user-agent': 'Nuxtbot (https://nuxt.com, 0.1)',
      Authorization: `Bearer ${access_token}`,
    },
  })

  const session = await getUserSession(event)
  await setUserSession(event, {
    ...session.data,
    roles: [], // reset discord roles if they exist to allow resyncing
    discordId: user.id,
  })

  return await sendRedirect(event, '/')
})
