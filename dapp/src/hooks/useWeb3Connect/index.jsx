import { useState } from 'react'
import Web3Connect from 'web3connect'
import Portis from '@portis/web3'
import Torus from '@toruslabs/torus-embed'

const providerOptions = {
  metamask: {
  },
  portis: {
    package: Portis,
    options: {
      id: CONFIG.web3.portis.id
    }
  },
  torus: {
    package: Torus, // required
    options: {
      enableLogging: CONFIG.env !== 'production',
      buttonPosition: 'top-right',
      buildEnv: CONFIG.env === 'production' ? 'production' : 'development'
    }
  }
}

const getProviderOptions = (latestProvider) => latestProvider && providerOptions[latestProvider]
  ? { [latestProvider]: providerOptions[latestProvider], disableInjectedProvider: latestProvider !== 'metamask' }
  : providerOptions

const useWeb3Connect = ({ latestProvider }, connectCallback) => {
  const [provider, setProvider] = useState()

  const web3Connect = new Web3Connect.Core({
    providerOptions: getProviderOptions(latestProvider)
  })

  web3Connect.on('connect', async (response) => {
    await setProvider(response)
    await connectCallback(response)
  })

  // web3Connect.on('close', () => {
  //   debugger
  //   web3Connect.toggleModal()
  // })

  const toggleModal = () => {
    web3Connect.toggleModal()
  }

  return { provider, toggleModal }
}

export default useWeb3Connect
