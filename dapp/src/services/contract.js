import abis from 'constants/abi'
import { getWeb3 } from 'services/web3'
import { getOptions } from 'utils/network'
import get from 'lodash/get'

const contracts = {
}

export const getContract = ({ address, abiName, options }) => {
  if (address && contracts.hasOwnProperty(address)) {
    return contracts[address]
  }

  const abi = abis[abiName]

  const web3 = getWeb3(options)
  const networkVersion = get(web3, 'currentProvider.networkVersion', false) || get(web3, 'currentProvider.connection.networkVersion', false)
  const contract = new web3.eth.Contract(abi, address, getOptions(networkVersion))
  contracts[address] = contract

  return contract
}
