
export const isNetworkSupported = (networkType) => CONFIG.web3.supportedNetworks.includes(networkType)

export const isNetworkDesired = (networkType) => CONFIG.web3.desiredNetworks.includes(networkType)
