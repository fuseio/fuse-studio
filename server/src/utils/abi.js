const Web3EthAbi = require('web3-eth-abi')

const getParamsFromMethodData = (abi, methodName, methodData) => {
  const methodABI = abi.filter(obj => obj.name === methodName)[0]
  const methodSig = Web3EthAbi.encodeFunctionSignature(methodABI)
  const params = Web3EthAbi.decodeParameters(methodABI.inputs, `0x${methodData.replace(methodSig, '')}`)
  return params
}
class Signatures {
  constructor () {
    this.dict = {}
  }

  addSigsnatures (abi, type) {
    const abiFragments = abi.filter(obj => obj.type === type)
    for (let abiFragment of abiFragments) {
      const methodSig = Web3EthAbi.encodeFunctionSignature(abiFragment)
      console.log({ methodSig })
    }
  }
}

module.exports = {
  getParamsFromMethodData,
  Signatures
}
