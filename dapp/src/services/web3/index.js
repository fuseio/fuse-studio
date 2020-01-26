import Web3 from 'web3'
import Box from '3box'
import { getProviderUrl } from 'utils/network'

let givenWeb3

export const getWeb3 = ({ provider, networkType } = {}) => {
  if (networkType) {
    const web3 = web3ByNetworkType[networkType]
    return web3
  }

  if (provider) {
    givenWeb3 = null
    givenWeb3 = new Web3(provider)
    return givenWeb3
  }

  if (givenWeb3) return givenWeb3
}

let box = null

export function get3box ({ accountAddress }) {
  if (box && box._web3provider.selectedAddress === accountAddress) {
    return box
  }
  return Box.openBox(accountAddress, window.ethereum)
}

export const fuse = new Web3(CONFIG.web3.fuseProvider)
export const main = new Web3(getProviderUrl('main'))
export const ropsten = new Web3(getProviderUrl('ropsten'))

fuse.currentProvider.networkVersion = String(CONFIG.web3.chainId.fuse)
main.currentProvider.networkVersion = String(CONFIG.web3.chainId.main)
ropsten.currentProvider.networkVersion = String(CONFIG.web3.chainId.ropsten)

const web3ByNetworkType = {
  fuse,
  ropsten,
  main
}

export default givenWeb3
