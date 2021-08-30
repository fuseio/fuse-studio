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
  methodData.split(10)
}
class Signatures {
  constructor () {
    this.dict = {}
  }

  addContract (contractName, abi, type) {
    const abiFragments = type ? abi.filter(obj => obj.type === type) : abi
    for (let abiFragment of abiFragments) {
      const methodSig = Web3EthAbi.encodeFunctionSignature(abiFragment)
      this.dict[methodSig] = { ...abiFragment, contractName }
    }
  }

  getFragment (sig) {
    return this.dict[sig]
  }
}
class JobParser {
  constructor (signatures) {
    this.signatures = signatures
  }

  parse ({ methodData }) {
    const signature = extractSignature(methodData)
    const methodABI = this.signatures.getFragment(signature)
    const params = Web3EthAbi.decodeParameters(methodABI.inputs, `0x${methodData.replace(methodSig, '')}`)
  }
}

module.exports = {
  getParamsFromMethodData,
  getParamsFromFragment,
  Signatures,
  JobParser
}
