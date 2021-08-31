const Web3EthAbi = require('web3-eth-abi')

const getParamsFromMethodData = (abi, methodName, methodData) => {
  const methodABI = abi.filter(obj => obj.name === methodName)[0]
  const methodSig = Web3EthAbi.encodeFunctionSignature(methodABI)
  const params = Web3EthAbi.decodeParameters(methodABI.inputs, `0x${methodData.replace(methodSig, '')}`)
  return params
}

const getParamsFromFragment = (abiFragment, methodName, methodData) => {
  const methodSig = Web3EthAbi.encodeFunctionSignature(abiFragment)
  const params = Web3EthAbi.decodeParameters(abiFragment.inputs, `0x${methodData.replace(methodSig, '')}`)
  return params
}

const extractSignature = (methodData) => {
  return methodData.slice(0, 10)
}

module.exports = {
  getParamsFromMethodData,
  getParamsFromFragment,
  extractSignature
}
