const Web3EthAbi = require('web3-eth-abi')
const {
  extractSignature
} = require('./shared')

class MethodParser {
  constructor (signatureStore) {
    this.signatureStore = signatureStore
  }

  parse (methodData) {
    const signature = extractSignature(methodData)
    const sigData = this.signatureStore.getFragment(signature)
    const params = Web3EthAbi.decodeParameters(sigData.inputs, `0x${methodData.replace(signature, '')}`)
    return { params, contractName: sigData.contractName, methodName: sigData.name }
  }
}

module.exports = MethodParser
