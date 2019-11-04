import { getProvider as getPortisProvider } from './portis'
import { getProvider as getZeroProvider } from './zero'

const providers = {
  metamask: () => window && window.ethereum,
  portis: () => getPortisProvider(),
  zero: (pk) => getZeroProvider({ pk: pk })
}

const initializeProvider = ({ provider }) => {
  console.log({ provider })
  // if (window.ethereum) {
  //   return window.ethereum
  // }

  if (window.pk) {
    return providers['zero'](window.pk)// getZeroProvider({ pk: window.pk })
  } else if (provider) {
    console.log({ temp: providers[provider]() })
    return providers[provider]()// getPortisProvider()
  }
}

export default initializeProvider
