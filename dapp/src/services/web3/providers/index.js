import { getProvider as getPortisProvider } from './portis'
import { getProvider as getZeroProvider } from './zero'

const initializeProvider = () => {
  if (window.ethereum) {
    return window.ethereum
  }

  if (window.pk) {
    return getZeroProvider({ pk: window.pk })
  } else {
    return getPortisProvider()
  }
}

export default initializeProvider
