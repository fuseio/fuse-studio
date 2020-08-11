import { useState } from 'react'
import Web3Modal from 'web3modal'
import Torus from '@toruslabs/torus-embed'
import Fortmatic from 'fortmatic'
import { loadState } from 'utils/storage'

const networkState = loadState('state.network') || CONFIG.web3.bridge.network
const { foreignNetwork } = networkState

const providerOptions = {
  network: foreignNetwork,
  metamask: {
  },
  fortmatic: {
    package: Fortmatic,
    options: {
      key: CONFIG.web3.fortmatic[foreignNetwork].id
    }
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
      config: {
        buildEnv: CONFIG.env === 'production' ? 'production' : 'development'
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
