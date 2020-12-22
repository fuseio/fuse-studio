import { networkIdToName } from 'constants/network'
import get from 'lodash/get'

export const isNetworkSupported = (networkType) => CONFIG.web3.supportedNetworks.includes(networkType)

const blockExplorers = {
  main: 'https://etherscan.io',
  ropsten: 'https://ropsten.etherscan.io',
  fuse: 'https://explorer.fuse.io'
}

export const getBlockExplorerUrl = (networkType) => blockExplorers[networkType]

export const getApiRoot = (networkType) => CONFIG.api.url[toShortName(networkType)] ? CONFIG.api.url[toShortName(networkType)] : CONFIG.api.url.default

export const isFuse = (provider) => (get(provider, 'networkVersion', false) || get(provider, 'connection.networkVersion', false)) === String(CONFIG.web3.chainId.fuse)

const getInfuraUrl = (networkType) => `https://${toLongName(networkType)}.infura.io/v3/${CONFIG.web3.apiKey}`

const getForeignProviderUrl = (networkType) => {
  if (CONFIG.web3.providers.default === 'alchemy') {
    return CONFIG.web3.providers.alchemy[toShortName(networkType)].http
  } else {
    getInfuraUrl(networkType)
  }
}

export const toLongName = (networkType) => networkType === 'main' ? 'mainnet' : networkType

export const toShortName = (networkType) => networkType === 'mainnet' ? 'main' : networkType

export const getProviderUrl = (networkType) => {
  if (networkType === 'fuse') {
    return CONFIG.web3.fuseProvider
  } else {
    return getForeignProviderUrl(networkType)
  }
}

export const getOptions = (networkVersion) => {
  const networkType = networkIdToName[networkVersion] || 'fuse'
  return CONFIG.web3.options[networkType]
}

export const getWeb3Options = (networkName) => {
  return CONFIG.web3.options[networkName]
}

export const getNetworkVersion = (provider) => {
  return get(provider, 'currentProvider.networkVersion', false) || get(provider, 'currentProvider.connection.networkVersion', false)
}

export const toNetworkType = (networkId) => networkIdToName[networkId] || 'unknown'

export const convertNetworkName = (name) => {
  if (name === 'main') {
    return 'Ethereum'
  } else {
    return name
  }
}
