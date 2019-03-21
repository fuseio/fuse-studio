
export const isNetworkSupported = (networkType) => CONFIG.web3.supportedNetworks.includes(networkType)

const blockExplorers = {
  main: 'https://etherscan.io',
  ropsten: 'https://ropsten.etherscan.io',
  fuse: 'https://explorer.fuse.io'
}

export const getBlockExplorerUrl = (networkType) => blockExplorers[networkType]

export const getApiRoot = (networkType) => CONFIG.api.url[networkType]

export const isFuse = (provider) => provider.networkVersion === '121'

export const getOptions = (provider) => {
  if (isFuse(provider)) {
    return CONFIG.web3.options.fuse
  }
}
