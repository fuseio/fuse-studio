import { useState } from 'react'
import Web3Modal from 'web3modal'
import Torus from '@toruslabs/torus-embed'

const providerOptions = {
  metamask: {
  },
  torus: {
    package: Torus,
    options: {
      enableLogging: CONFIG.env !== 'production',
      buildEnv: CONFIG.torus.env,
      buttonPosition: 'top-right',
      networkParams: {
        host: CONFIG.web3.fuseProvider,
        networkName: 'fuse',
        chainId: CONFIG.web3.chainId.fuse
      }
    }
  }
}

const useWeb3Connect = (connectCallback) => {
  const [provider, setProvider] = useState()

  const web3Modal = new Web3Modal({
    network: 'ropsten',
    providerOptions,
    cacheProvider: true
  })

  web3Modal.on('connect', (provider) => {
    setProvider(provider)
    connectCallback(provider)
  })

  web3Modal.on('disconnected', () => {
    setProvider(null)
  })

  const toggleModal = () => {
    web3Modal.toggleModal()
  }

  return { provider, toggleModal, core: web3Modal }
}

export default useWeb3Connect
