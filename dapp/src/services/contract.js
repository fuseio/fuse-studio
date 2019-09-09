import abis from 'constants/abi'
import { getWeb3 } from 'services/web3'
import { getOptions, getNetworkVersion } from 'utils/network'

const contracts = {
}

export const getContract = ({ address, abiName, options }) => {
  if (address && contracts.hasOwnProperty(address)) {
    return contracts[address]
  }

  const abi = abis[abiName]

  const web3 = getWeb3(options)
  const networkVersion = getNetworkVersion(web3)
  const contract = new web3.eth.Contract(abi, address, getOptions(networkVersion))
  contracts[address] = contract

  return contract
}
