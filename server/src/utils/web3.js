const Web3 = require('web3')
const config = require('config')
const mongoose = require('mongoose')
const Account = mongoose.model('Account')

function add0xPrefix (str) {
  if (str.indexOf('0x') === 0) {
    return str
  }
  return `0x${str}`
}

const createWeb3 = (providerUrl) => {
  const web3 = new Web3(providerUrl)
  const account = web3.eth.accounts.wallet.add(add0xPrefix(config.get('secrets.fuse.bridge.privateKey')))
  return { from: account.address, web3 }
}

const createContract = (web3, bridgeType, abi, address) =>
  new web3.eth.Contract(abi, address, config.get(`network.${bridgeType}.contract.options`))

const createMethod = (contract, methodName, ...args) => {
  const { inspect } = require('util')
  console.log(`creating method ${methodName} with arguments: ${inspect(...args)}}`)

  let method
  if (methodName === 'deploy') {
    method = contract[methodName](...args)
  } else {
    method = contract.methods[methodName](...args)
  }
  method.methodName = methodName
  return method
}

const getMethodName = (method) => method.methodName || 'unknown'

const send = async (web3, bridgeType, method, options) => {
  const doSend = async () => {
    const methodName = getMethodName(method)
    console.log(`[${bridgeType}] sending method ${methodName} from ${from} with nonce ${account.nonce}. gas price: ${gasPrice}, gas limit: ${gas}`)
    receipt = await method.send({ gasPrice, ...options, gas, nonce: account.nonce, chainId: bridgeType === 'home' ? 121 : undefined })
    console.log(`[${bridgeType}] method ${methodName} succeeded in tx ${receipt.transactionHash}`)
  }

  const { from } = options
  const gas = await method.estimateGas({ from })
  const gasPrice = bridgeType === 'home' ? '1000000000' : undefined
  const account = await Account.findOneOrCreate({ bridgeType, address: from })
  let receipt
  try {
    await doSend()
  } catch (error) {
    const nonce = await web3.eth.getTransactionCount(from)
    account.nonce = nonce
    await doSend()
  }
  account.nonce++
  await account.save()
  return receipt
}

module.exports = {
  createWeb3,
  createContract,
  createMethod,
  send
}
