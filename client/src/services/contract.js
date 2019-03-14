import abis from 'constants/abi'
import {getWeb3} from 'services/web3'

const contracts = {
}

export const getContract = ({address, abiName, options}) => {
  if (address && contracts.hasOwnProperty(address)) {
    return contracts[address]
  }

  const abi = abis[abiName]

  const web3 = getWeb3(options)
  const contract = new web3.eth.Contract(abi, address)
  contracts[address] = contract

  return contract
}
