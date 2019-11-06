import Web3 from 'web3'
import Box from '3box'
import { isFuse, getProviderUrl } from 'utils/network'
import initializeProvider from './providers'
import isEmpty from 'lodash/isEmpty'
import { loadState } from 'utils/storage'

let givenWeb3

export const getWeb3Instance = (provider) => {
  const loadedProvider = (!isEmpty(loadState('state.provider')) && loadState('state.provider'))
    ? loadState('state.provider')
    : window && window.ethereum
      ? { provider: 'metamask' }
      : { provider: 'portis' }
  if (!provider) {
    provider = loadedProvider && loadedProvider.provider
  }
  return new Web3(initializeProvider({ provider }))
}

export const getWeb3 = ({ bridgeType, provider } = {}) => {
  if (!bridgeType) {
    return getWeb3Instance(provider)
  }
  if (bridgeType === 'home' && isFuse(window.ethereum)) {
    return getWeb3Instance(provider)
  }

  if (bridgeType === 'foreign' && !isFuse(window.ethereum)) {
    return getWeb3Instance(provider)
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

const foreignProviderUrl = getProviderUrl((networkState && networkState.networkType) || foreignNetwork)

export const homeWeb3 = new Web3(CONFIG.web3.fuseProvider)
export const foreignWeb3 = new Web3(foreignProviderUrl)

homeWeb3.currentProvider.networkVersion = String(CONFIG.web3.chainId.fuse)
foreignWeb3.currentProvider.networkVersion = String(CONFIG.web3.chainId[(networkState && networkState.networkType) || foreignNetwork])

const web3ByBridge = {
  home: homeWeb3,
  foreign: foreignWeb3
}

export default givenWeb3
