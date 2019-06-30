import { getProvider as getPortisProvider } from './portis'
import { getProvider as getZeroProvider } from './zero'

const initializeProvider = () => {
  if (window.ethereum) {
    return window.ethereum
  }
  const provider = getZeroProvider()
  return provider
}

export default initializeProvider
