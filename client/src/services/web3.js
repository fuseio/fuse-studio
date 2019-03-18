import Web3 from 'web3'

export const getWeb3 = ({bridgeType} = {}) => {
  if (!bridgeType) {
    return givenWeb3
  }
  if (bridgeType === 'home' && Web3.givenProvider.networkVersion === '121') {
    return givenWeb3
  }

  if (bridgeType === 'foreign' && Web3.givenProvider.networkVersion !== '121') {
    return givenWeb3
  }
  const web3 = web3ByBridge[bridgeType]
  return web3
}

export const givenWeb3 = new Web3(Web3.givenProvider || CONFIG.web3.provider)
export const homeWeb3 = new Web3(CONFIG.web3.fuseProvider)
export const foreignWeb3 = new Web3(CONFIG.web3.provider)

const web3ByBridge = {
  home: homeWeb3,
  foreign: foreignWeb3
}

export default givenWeb3
