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

  const config = useRuntimeConfig(event)

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

  session.data.discordId = user.id

  // makes sure the user is in the guild
  if (!session.data.guildMemberAdded) {
    await $fetch(`https://discord.com/api/guilds/${config.discord.guildId}/members/${session.data.discordId}`, {
      method: 'PUT',
      body: {
        access_token,
      },
      headers: {
        'user-agent': 'Nuxters (https://nuxters.nuxt.com, 0.1)',
        Authorization: `Bot ${config.discord.botToken}`,
      },
    })
    session.data.guildMemberAdded = true
  }

  if (event.context.canUnlockNuxterBadge && config.discord.nuxterRoleId) {
    await $fetch(
      `https://discord.com/api/guilds/${config.discord.guildId}/members/${session.data.discordId}/roles/${config.discord.nuxterRoleId}`,
      {
        method: 'PUT',
        headers: {
          'user-agent': 'Nuxters (https://nuxters.nuxt.com, 0.1)',
          Authorization: `Bot ${config.discord.botToken}`,
        },
      }
    )
    session.data.nuxterRoleAdded = true
  }

  if (event.context.canUnlockModuleBadge && config.discord.moduleMaintainerRoleId) {
    await $fetch(
      `https://discord.com/api/guilds/${config.discord.guildId}/members/${session.data.discordId}/roles/${config.discord.moduleMaintainerRoleId}`,
      {
        method: 'PUT',
        headers: {
          'user-agent': 'Nuxters (https://nuxters.nuxt.com, 0.1)',
          Authorization: `Bot ${config.discord.botToken}`,
        },
      }
    )
  }

  console.log('event.context.canUnlockUIProBadge', event.context.canUnlockUIProBadge, config.discord.uIProRoleId)
  if (event.context.canUnlockUIProBadge && config.discord.uIProRoleId) {
    await $fetch(
      `https://discord.com/api/guilds/${config.discord.guildId}/members/${session.data.discordId}/roles/${config.discord.uIProRoleId}`,
      {
        method: 'PUT',
        headers: {
          'user-agent': 'Nuxters (https://nuxters.nuxt.com, 0.1)',
          Authorization: `Bot ${config.discord.botToken}`,
        },
      }
    )
  }

  await setUserSession(event, session.data)

  return await sendRedirect(event, '/')
})
