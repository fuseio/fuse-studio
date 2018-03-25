import web3 from 'services/web3/web3'
import addressess from 'constants/addresses'

const contracts = {}

export const createContract = (contractName) => {
  const address = addressess[contractName]
  const abi = require('constants/abi/' + contractName).default
  return new web3.eth.Contract(abi, address)
}

export const getContract = (contractName) => {
  if (contracts.hasOwnProperty(contractName)) {
    return contracts[contractName]
  }
  contracts[contractName] = createContract(contractName)
  return contracts[contractName]
}
