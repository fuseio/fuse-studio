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
