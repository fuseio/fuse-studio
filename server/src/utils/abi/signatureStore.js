const Web3EthAbi = require('web3-eth-abi')

class SignatureStore {
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
module.exports = SignatureStore
