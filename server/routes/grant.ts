export default defineEventHandler(async event => {
  if (event.context.contributions > 0) {
    if (!event.context.roles?.includes('nuxter')) {
      const session = await getUserSession(event)
      const config = useRuntimeConfig()
      await $fetch(
        `https://discord.com/api/guilds/${config.discord.guildId}/members/${session.data.discordId}/roles/${config.discord.memberRoleId}`,
        {
          method: 'PUT',
          headers: {
            'user-agent': 'Nuxtbot (https://nuxt.com, 0.1)',
            Authorization: `Bot ${config.discord.botToken.trim()}`,
          },
        }
      )
      await setUserSession(event, {
        ...session.data,
        roles: [...(session.data.roles || []), 'nuxter'],
      })
    }
  }

  await sendRedirect(event, '/')
})
