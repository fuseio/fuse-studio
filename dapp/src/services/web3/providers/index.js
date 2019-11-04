import { loadState } from 'utils/storage'
import { getProvider as getPortisProvider } from './portis'
import { getProvider as getZeroProvider } from './zero'

const providers = {
  metamask: () => window && window.ethereum,
  portis: () => getPortisProvider(),
  zero: (pk) => getZeroProvider({ pk: pk })
}

const initializeProvider = ({ provider }) => {
  // if (window.ethereum) {
  //   return window.ethereum
  // }

  const loadedProvider = loadState('state.provider')
    ? loadState('state.provider')
    : window && window.ethereum
      ? { provider: 'metamask' }
      : { provider: 'portis' }
  if (!provider) {
    provider = loadedProvider && loadedProvider.provider
  }

  if (window.pk) {
    return providers['zero'](window.pk)// getZeroProvider({ pk: window.pk })
  } else if (provider) {
    return providers[provider]()// getPortisProvider()
  }
}

export default initializeProvider
