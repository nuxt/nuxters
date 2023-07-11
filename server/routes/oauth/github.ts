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

  const { access_token } = await $fetch<{ access_token: string }>('https://github.com/login/oauth/access_token', {
    method: 'POST',
    body: {
      client_id: config.github.clientId,
      client_secret: config.github.clientSecret,
      code,
    },
  })

  if (!access_token) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Authorisation code invalid.',
    })
  }

  const ghUser = await $fetch<{ id: number, login: string }>('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${access_token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'Nuxter',
    },
  })

  const session = await getUserSession(event)
  await setUserSession(event, {
    ...session.data,
    githubId: ghUser.id,
    githubUsername: ghUser.login,
  })

  return await sendRedirect(event, '/')
})
