import Web3 from 'web3'
import {isFuse, getProviderUrl} from 'utils/network'
import {loadState} from 'utils/storage'

export const getWeb3 = ({bridgeType} = {}) => {
  if (!bridgeType) {
    return givenWeb3
  }
  if (bridgeType === 'home' && isFuse(Web3.givenProvider)) {
    return givenWeb3
  }

  if (bridgeType === 'foreign' && !isFuse(Web3.givenProvider)) {
    return givenWeb3
  }
  const web3 = web3ByBridge[bridgeType]
  return web3
}

const networkState = loadState('state.network') || CONFIG.web3.bridge.network
const {foreignNetwork} = networkState

const foreignProviderUrl = getProviderUrl(foreignNetwork)
export const givenWeb3 = new Web3(Web3.givenProvider || foreignProviderUrl)
export const homeWeb3 = new Web3(CONFIG.web3.fuseProvider)
export const foreignWeb3 = new Web3(foreignProviderUrl)

const web3ByBridge = {
  home: homeWeb3,
  foreign: foreignWeb3
}

export default givenWeb3
