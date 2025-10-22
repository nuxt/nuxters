import { joinURL } from 'ufo'
import { createOperationsGenerator } from '#image'
import type { ProviderGetImage } from '@nuxt/image'

const operationsGenerator = createOperationsGenerator({
  joinWith: '&',
})

export const getImage: ProviderGetImage = (src, { modifiers, baseURL }) => {
  baseURL ||= 'https://avatars.githubusercontent.com/'

  let size = 460 // Default size
  if (modifiers?.width || modifiers?.height)
    // Calculate size based on width/height
    size = Math.max(modifiers?.height ?? 0, modifiers?.width ?? 0)

  const operations = operationsGenerator({
    v: '4',
    s: size.toString(),
  })

  return {
    url: joinURL(baseURL, src + (operations ? '?' + operations : '')),
  }
}
