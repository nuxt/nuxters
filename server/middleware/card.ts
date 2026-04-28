import { sendRedirect } from 'h3'

export default defineEventHandler(async (event) => {
  if (event.method === 'GET' && event.path.startsWith('/card/') && event.path.endsWith('/og.png')) {
    const [,,username] = event.path.split('/')
    return sendRedirect(event, `/_og/r/${username}.png`)
  }
  if (event.method === 'GET' && event.path.startsWith('/__og-image__/image/') && event.path.endsWith('/og.png')) {
    const [,,,username] = event.path.split('/')
    return sendRedirect(event, `/_og/r/${username}.png`)
  }
})
