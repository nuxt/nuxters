export default defineEventHandler(async event => {
  if (event.context.contributions && event.context.contributions.count > 0) {
    const config = useRuntimeConfig()
    await $fetch(
      `https://discord.com/api/guilds/${config.discord.guildId}/members/${user.id}/roles/${config.discord.memberRoleId}`,
      {
        method: 'PUT',
        headers: {
          'user-agent': 'Nuxtbot (https://nuxt.com, 0.1)',
          Authorization: `Bot ${config.discord.botToken.trim()}`,
        },
      }
    )
  }

  await sendRedirect(event, '/')
})
