import { networkIdToName } from 'constants/network'

export const isNetworkSupported = (networkType) => CONFIG.web3.supportedNetworks.includes(networkType)

const blockExplorers = {
  main: 'https://etherscan.io',
  ropsten: 'https://ropsten.etherscan.io',
  fuse: 'https://explorer.fuse.io'
}

export const getBlockExplorerUrl = (networkType) => blockExplorers[networkType]

export const getApiRoot = (networkType) => CONFIG.api.url[networkType]

export const isFuse = (provider) => provider.connection.networkVersion === '121'

const getInfuraUrl = (networkType) => {
  return `https://${toLongName(networkType)}.infura.io/v3/${CONFIG.web3.apiKey}`
}

export const toLongName = (networkType) => networkType === 'main' ? 'mainnet' : networkType

export const getProviderUrl = (networkType) => {
  if (networkType === 'fuse') {
    return CONFIG.web3.fuseProvider
  } else {
    return getInfuraUrl(networkType, CONFIG.web3.apiKey)
  }
}

export const getOptions = (networkVersion) => {
  const networkType = networkIdToName[networkVersion]
  return CONFIG.web3.options[networkType]
}

export const convertNetworkName = (name) => {
  if (name === 'main') {
    return 'Ethereum'
  } else {
    return name
  }
}
