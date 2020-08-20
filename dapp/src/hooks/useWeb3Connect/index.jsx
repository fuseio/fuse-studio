import { useState } from 'react'
import Web3Modal from 'web3modal'
import Torus from '@toruslabs/torus-embed'
import Fortmatic from 'fortmatic'
import { loadState } from 'utils/storage'
import { get } from 'lodash'
import { toShortName, toLongName } from 'utils/network'

const network = get(loadState('state.network'), 'foreignNetwork', null) || CONFIG.web3.bridge.network.foreignNetwork

const providerOptions = {
  metamask: {
  },
  fortmatic: {
    package: Fortmatic,
    options: {
      network: toLongName(network),
      key: CONFIG.web3.fortmatic[toShortName(network)].id
    }
  },
  // portis: {
  //   package: Portis,
  //   options: {
  //     id: CONFIG.web3.portis.id
  //   }
  // },
  torus: {
    package: Torus,
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
