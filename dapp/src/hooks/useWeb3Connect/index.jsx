import { useState } from 'react'
import Web3Modal from 'web3modal'
// import Portis from '@portis/web3'
import Torus from '@toruslabs/torus-embed'

const providerOptions = {
  metamask: {
  },
  // portis: {
  //   package: Portis,
  //   options: {
  //     id: CONFIG.web3.portis.id
  //   }
  // },
  torus: {
    package: Torus, // required
    options: {
      enableLogging: CONFIG.env !== 'production',
      buttonPosition: 'top-right',
      buildEnv: CONFIG.env === 'production' ? 'production' : 'development'
    }
  }
}

const useWeb3Connect = (connectCallback) => {
  const [provider, setProvider] = useState()

  const web3Modal = new Web3Modal({
    providerOptions,
    cacheProvider: true
  })

  web3Modal.on('connect', async (response) => {
    setProvider(response)
    connectCallback(response)
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
