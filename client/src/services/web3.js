import {init, get} from 'osseus-wallet'
import Web3 from 'web3'
import abi from 'constants/abi'
import {networkNameToId} from 'constants/network'

const config = {
  osseus_wallet: {
    abi,
    ...CONFIG.web3
  }
}

export const getWeb3 = ({networkBridge, networkType} = {}) => {
  if (networkBridge) {
    return getWeb3ByBridge({networkBridge})
  }
  return getWeb3ByNetwork({networkType})
}

const getWeb3ByBridge = ({networkBridge} = {}) => {
  if (!networkBridge) {
    return givenWeb3
  }
  if (networkBridge === 'home' && Web3.givenProvider.networkVersion === '121') {
    return givenWeb3
  }

  if (networkBridge === 'foreign' && Web3.givenProvider.networkVersion !== '121') {
    return givenWeb3
  }
  const web3 = web3ByBridge[networkBridge]
  return web3
}

const getWeb3ByNetwork = ({networkType} = {}) => {
  if (!networkType) {
    return givenWeb3
  }
  const networkId = networkNameToId[networkType]

  if (Web3.givenProvider.networkVersion === String(networkId)) {
    return givenWeb3
  }

  return web3ByNetwork[networkType]
}

export const givenWeb3 = new Web3(Web3.givenProvider || CONFIG.web3.provider)
export const homeWeb3 = new Web3(CONFIG.web3.fuseProvider)
export const foreignWeb3 = new Web3(CONFIG.web3.provider)

const web3ByBridge = {
  home: homeWeb3,
  foreign: foreignWeb3
}

const web3ByNetwork = {
  fuse: homeWeb3,
  ropsten: foreignWeb3
}

init({config})

export default get()
