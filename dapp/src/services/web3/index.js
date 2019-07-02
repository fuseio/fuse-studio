import Web3 from 'web3'
import Box from '3box'
import { isFuse, getProviderUrl } from 'utils/network'
import initializeProvider from './providers'

import { loadState } from 'utils/storage'

let givenWeb3

export const getWeb3Instance = () => {
  if (givenWeb3) {
    return givenWeb3
  }
  givenWeb3 = new Web3(initializeProvider())
  return givenWeb3
}

export const getWeb3 = ({ bridgeType } = {}) => {
  if (!bridgeType) {
    return getWeb3Instance()
  }
  if (bridgeType === 'home' && isFuse(window.ethereum)) {
    return getWeb3Instance()
  }

  if (bridgeType === 'foreign' && !isFuse(window.ethereum)) {
    return getWeb3Instance()
  }
  const web3 = web3ByBridge[bridgeType]
  return web3
}

let box = null

export function get3box ({ accountAddress }) {
  if (box && box._web3provider.selectedAddress === accountAddress) {
    return box
  }
  return Box.openBox(accountAddress, window.ethereum)
}

const networkState = loadState('state.network') || CONFIG.web3.bridge.network
const { foreignNetwork } = networkState

const foreignProviderUrl = getProviderUrl(foreignNetwork)

// export const givenWeb3 = new Web3(initializeProvider())

export const homeWeb3 = new Web3(CONFIG.web3.fuseProvider)
export const foreignWeb3 = new Web3(foreignProviderUrl)

const web3ByBridge = {
  home: homeWeb3,
  foreign: foreignWeb3,
}

export default givenWeb3
