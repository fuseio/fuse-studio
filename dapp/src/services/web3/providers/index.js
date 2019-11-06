import { getProvider as getPortisProvider } from './portis'
import { getProvider as getZeroProvider } from './zero'

const providers = {
  metamask: () => window && window.ethereum,
  portis: () => getPortisProvider(),
  zero: (pk) => getZeroProvider({ pk: pk })
}

const initializeProvider = ({ provider }) => {
  if (window.pk) {
    return providers['zero'](window.pk)
  } else if (provider) {
    const newProvider = providers[provider]
    return newProvider()
  }
}

export default initializeProvider
