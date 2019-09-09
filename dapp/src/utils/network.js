import { networkIdToName } from 'constants/network'
import get from 'lodash/get'

export const isNetworkSupported = (networkType) => CONFIG.web3.supportedNetworks.includes(networkType)

const blockExplorers = {
  main: 'https://etherscan.io',
  ropsten: 'https://ropsten.etherscan.io',
  fuse: 'https://explorer.fusenet.io'
}

export const getBlockExplorerUrl = (networkType) => blockExplorers[networkType]

export const getApiRoot = (networkType) => CONFIG.api.url[networkType]

export const isFuse = (provider) => (get(provider, 'networkVersion', false) || get(provider, 'connection.networkVersion', false)) === String(CONFIG.web3.chainId.fuse)

const getInfuraUrl = (networkType) => {
  return `https://${toLongName(networkType)}.infura.io/v3/${CONFIG.web3.apiKey}`
}

export const toLongName = (networkType) => networkType === 'main' ? 'mainnet' : networkType

export const getProviderUrl = (networkType) => {
  if (networkType === 'fuse') {
    return CONFIG.web3.fuseProvider
  } else {
    return getInfuraUrl(networkType)
  }
}

export const getOptions = (networkVersion) => {
  const networkType = networkIdToName[networkVersion] || 'fuse'
  return CONFIG.web3.options[networkType]
}

export const getNetworkVersion = (provider) => {
  return get(provider, 'currentProvider.networkVersion', false) || get(provider, 'currentProvider.connection.networkVersion', false)
}

export const convertNetworkName = (name) => {
  if (name === 'main') {
    return 'Ethereum'
  } else {
    return name
  }
}
