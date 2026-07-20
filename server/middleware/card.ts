import { createError, sendRedirect } from 'h3'

const RE_META_TAG = /<meta\s+[^>]*>/gi
const RE_OG_IMAGE_PROPERTY = /\bproperty=["']og:image["']/i
const RE_META_CONTENT = /\bcontent=["']([^"']+)["']/i
const RE_PROFILE_OG_IMAGE = /^\/_og\/r\/([a-z\d](?:[a-z\d-]{0,38}))\.png$/i

function getOgImageUrl(html: string) {
  const ogImageMeta = html.match(RE_META_TAG)?.find(tag => RE_OG_IMAGE_PROPERTY.test(tag))
  return ogImageMeta?.match(RE_META_CONTENT)?.[1]?.replaceAll('&amp;', '&')
}

async function resolveProfileOgImage(event: Parameters<typeof sendRedirect>[0], username: string) {
  const html = await event.$fetch<string>(`/${username}`, {
    headers: { accept: 'text/html' },
    responseType: 'text',
  })
  const ogImageUrl = getOgImageUrl(html)

  if (!ogImageUrl) {
    throw createError({
      statusCode: 404,
      statusMessage: `OG image not found for ${username}`,
    })
  }

  return sendRedirect(event, ogImageUrl)
}

export default defineEventHandler(async (event) => {
  if (event.method !== 'GET') {
    return
  }

  const pathname = event.path.split('?')[0]!

  // nuxt-og-image's resolver currently receives a relative URL from Vercel's
  // native H3 adapter, which makes getQuery(event) throw before rendering.
  const profileOgImageMatch = pathname.match(RE_PROFILE_OG_IMAGE)
  if (profileOgImageMatch?.[1]) {
    return resolveProfileOgImage(event, profileOgImageMatch[1])
  }

  if (pathname.startsWith('/card/') && pathname.endsWith('/og.png')) {
    const [,,username] = pathname.split('/')
    return sendRedirect(event, `/_og/r/${username}.png`)
  }
  if (pathname.startsWith('/__og-image__/image/') && pathname.endsWith('/og.png')) {
    const [,,,username] = pathname.split('/')
    return sendRedirect(event, `/_og/r/${username}.png`)
  }
})
