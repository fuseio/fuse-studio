import { useState } from 'react'
import Web3Connect from 'web3connect'

const useWeb3Connect = (options, connectCallback) => {
  const network = options.network
  const providerOptions = options.providerOptions
  const [provider, setProvider] = useState()

  const web3Connect = new Web3Connect.Core({
    network,
    providerOptions
  })

  // subscribe to connect
  web3Connect.on('connect', async (response) => {
    await setProvider(response)
    await connectCallback(response)
  })

  // subscribe to close
  web3Connect.on('close', () => { })

  const toggleModal = () => {
    web3Connect.toggleModal()
  }

  return { provider, toggleModal }
}

export default useWeb3Connect
