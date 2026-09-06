import { defaultCache } from '@serwist/next/worker'
import { NetworkOnly, Serwist } from 'serwist'

const serwist = new Serwist({
  // @ts-expect-error - __SW_MANIFEST is injected by serwist build plugin
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url }) => url.origin !== self.location.origin,
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
})

serwist.addEventListeners()

