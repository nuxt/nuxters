export default defineEventHandler(async event => {
  await clearUserSession(event)
  await sendRedirect(event, '/')
})
