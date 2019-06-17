const Web3 = require('web3')
const ethUtils = require('ethereumjs-util')
const config = require('config')
const { fromMasterSeed } = require('ethereumjs-wallet/hdkey')
const { inspect } = require('util')
const mongoose = require('mongoose')
const Account = mongoose.model('Account')
const { fetchGasPrice } = require('@utils/network')
const wallet = fromMasterSeed(config.get('secrets.accounts.seed'))

const createWeb3 = (providerUrl) => {
  const web3 = new Web3(providerUrl)
  const account = web3.eth.accounts.wallet.add(ethUtils.addHexPrefix(config.get('secrets.fuse.bridge.privateKey')))
  return { from: account.address, web3 }
}

const createContract = ({ web3, bridgeType }, abi, address) =>
  new web3.eth.Contract(abi, address, config.get(`network.${bridgeType}.contract.options`))

const createMethod = (contract, methodName, ...args) => {
  console.log(`creating method ${methodName} with arguments: ${inspect(args)}`)

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

const getGasPrice = async (bridgeType, web3) => {
  if (bridgeType === 'home') {
    return '1000000000'
  }
  const gasPrice = await fetchGasPrice('fast')
  return web3.utils.toWei(gasPrice.toString(), 'gwei')
}

const retries = 2

const send = async ({ web3, bridgeType, address }, method, options) => {
  const doSend = async () => {
    const methodName = getMethodName(method)
    const nonce = account.nonces[bridgeType]
    console.log(`[${bridgeType}] sending method ${methodName} from ${from} with nonce ${nonce}. gas price: ${gasPrice}, gas limit: ${gas}`)
    receipt = await method.send({ gasPrice, ...options, gas, nonce: nonce, chainId: bridgeType === 'home' ? 121 : undefined })
    console.log(`[${bridgeType}] method ${methodName} succeeded in tx ${receipt.transactionHash}`)
  }

  const from = address
  const gas = await method.estimateGas({ from })
  const gasPrice = await getGasPrice(bridgeType, web3)
  const account = await Account.findOne({ address })
  let receipt
  for (let i = 0; i < retries; i++) {
    try {
      await doSend()
      break
    } catch (error) {
      console.error(error)
      const nonce = await web3.eth.getTransactionCount(from)
      account.nonces[bridgeType] = nonce
    }
  }
  if (receipt) {
    account.nonces[bridgeType]++
    await Account.updateOne({ address }, { [`nonces.${bridgeType}`]: account.nonces[bridgeType] })
  }

  return receipt
}

const getPrivateKey = (account) => {
  const derivedWallet = wallet.deriveChild(account.childIndex).getWallet()
  const derivedAddress = derivedWallet.getChecksumAddressString()
  if (account.address !== derivedAddress) {
    throw new Error(`Account address does not match with the private key. account address: ${account.address}, derived: ${derivedAddress}`)
  }
  return ethUtils.addHexPrefix(ethUtils.bufferToHex(derivedWallet.getPrivateKey()))
}

const createNetwork = (bridgeType, account) => {
  const web3 = new Web3(config.get(`network.${bridgeType}.provider`))
  web3.eth.accounts.wallet.add(getPrivateKey(account))

  return {
    from: account.address,
    web3,
    createContract: createContract.bind(null, { web3, bridgeType, address: account.address }),
    createMethod,
    send: send.bind(null, { web3, bridgeType, address: account.address })
  }
}

const toBufferStripPrefix = (str) => Buffer.from(ethUtils.stripHexPrefix(str), 'hex')

const generateSignature = async (method, methodArguments, privateKey) => {
  const msg = await method(...methodArguments).call()
  const vrs = ethUtils.ecsign(toBufferStripPrefix(msg), toBufferStripPrefix(privateKey))
  return ethUtils.toRpcSig(vrs.v, vrs.r, vrs.s)
}

module.exports = {
  createWeb3,
  generateSignature,
  createContract,
  createMethod,
  send,
  createNetwork
}
