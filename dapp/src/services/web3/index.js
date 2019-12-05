import Web3 from 'web3'
import Box from '3box'
import { getProviderUrl } from 'utils/network'
import initializeProvider from './providers'
import isEmpty from 'lodash/isEmpty'
import { loadState } from 'utils/storage'

let givenWeb3

export const getWeb3Instance = (provider) => {
  // if (givenWeb3) {
  //   return givenWeb3
  // }

  // const loadedProvider = (!isEmpty(loadState('state.provider')) && loadState('state.provider'))
  //   ? loadState('state.provider')
  //   : window && window.ethereum
  //     ? { provider: 'metamask' }
  //     : { provider: 'portis' }
  // if (!provider) {
  //   provider = loadedProvider && loadedProvider.provider
  // }
  // givenWeb3 = new Web3(initializeProvider({ provider }))
  // return givenWeb3
}

export const getWeb3 = ({ provider, bridgeType } = {}) => {
  console.log({ provider, bridgeType })
  if (bridgeType) {
    return web3ByBridge[bridgeType]
  }
 
  if (givenWeb3) return givenWeb3
  if (provider) {
    givenWeb3 = new Web3(provider)
    return givenWeb3
  }
  // // const web3 = web3ByBridge[bridgeType]
  // return givenWeb3
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

export const homeWeb3 = new Web3(CONFIG.web3.fuseProvider)
export const foreignWeb3 = new Web3(foreignProviderUrl)

homeWeb3.currentProvider.networkVersion = String(CONFIG.web3.chainId.fuse)
foreignWeb3.currentProvider.networkVersion = String(CONFIG.web3.chainId[foreignNetwork])

const web3ByBridge = {
  home: homeWeb3,
  foreign: foreignWeb3
}

export default givenWeb3
