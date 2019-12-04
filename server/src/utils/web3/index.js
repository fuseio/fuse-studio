const Web3 = require('web3')
const ethUtils = require('ethereumjs-util')
const ethers = require('ethers')
const config = require('config')
const { fromMasterSeed } = require('ethereumjs-wallet/hdkey')
const { inspect } = require('util')
const mongoose = require('mongoose')
const Account = mongoose.model('Account')
const { fetchGasPrice } = require('@utils/network')
const wallet = fromMasterSeed(config.get('secrets.accounts.seed'))

const createWeb3 = (providerUrl, account) => {
  const web3 = new Web3(providerUrl)
  let walletAccount
  if (account) {
    walletAccount = web3.eth.accounts.wallet.add(getPrivateKey(account))
  } else {
    walletAccount = web3.eth.accounts.wallet.add(ethUtils.addHexPrefix(config.get('secrets.fuse.bridge.privateKey')))
  }
  return { from: walletAccount.address, web3 }
}

const createContract = ({ web3, bridgeType }, abi, address) => {
  const contract = new web3.eth.Contract(abi, address, config.get(`network.${bridgeType}.contract.options`))
  contract.bridgeType = bridgeType
  return contract
}

const createMethod = (contract, methodName, ...args) => {
  console.log(`creating method ${methodName} with arguments: ${inspect(args)}`)

  let method
  if (methodName === 'deploy') {
    method = contract[methodName](...args)
  } else {
    method = contract.methods[methodName](...args)
  }
  method.methodName = methodName
  method.contract = contract
  return method
}

const createNetwork = (bridgeType, account) => {
  const { web3, from } = createWeb3(config.get(`network.${bridgeType}.provider`), account)

  return {
    from,
    web3,
    createContract: createContract.bind(null, { web3, bridgeType, address: from }),
    createMethod,
    send: send.bind(null, { web3, bridgeType, address: from })
  }
}

const getMethodName = (method) => method.methodName || 'unknown'

const getGasPrice = async (bridgeType, web3) => {
  if (bridgeType === 'home') {
    return config.get('network.home.gasPrice')
  }
  const gasPrice = await fetchGasPrice('fast')
  return web3.utils.toWei(gasPrice.toString(), 'gwei')
}

const retries = 3

const TRANSACTION_HASH_IMPORTED = 'Node error: {"code":-32010,"message":"Transaction with the same hash was already imported."}'
const TRANSACTION_HASH_TOO_LOW = 'Node error: {"code":-32010,"message":"Transaction nonce is too low. Try incrementing the nonce."}'
const TRANSACTION_TIMEOUT = 'Error: Timeout exceeded during the transaction confirmation process. Be aware the transaction could still get confirmed!'

const send = async ({ web3, bridgeType, address }, method, options) => {
  const doSend = async (retry) => {
    let transactionHash
    const methodName = getMethodName(method)
    const nonce = account.nonces[bridgeType]
    console.log(`[${bridgeType}][retry: ${retry}] sending method ${methodName} from ${from} with nonce ${nonce}. gas price: ${gasPrice}, gas limit: ${gas}, options: ${inspect(options)}`)
    const methodParams = { gasPrice, ...options, gas, nonce: nonce, chainId: bridgeType === 'home' ? config.get('network.home.chainId') : undefined }
    const promise = method.send({ ...methodParams })
    promise.on('transactionHash', (hash) => {
      transactionHash = hash
    })

    try {
      const receipt = await promise
      console.log(`[${bridgeType}] method ${methodName} succeeded in tx ${receipt.transactionHash}`)
      return { receipt }
    } catch (error) {
      console.error(error)

      const updateNonce = async () => {
        const nonce = await web3.eth.getTransactionCount(from)
        account.nonces[bridgeType] = nonce
      }

      const errorHandlers = {
        [TRANSACTION_HASH_IMPORTED]: async () => {
          if (transactionHash) {
            const receipt = await web3.eth.getTransactionReceipt(transactionHash)
            return { receipt }
          }
        },
        [TRANSACTION_HASH_TOO_LOW]: updateNonce,
        [TRANSACTION_TIMEOUT]: updateNonce
      }
      const errorMessage = error.message || error.error
      if (errorHandlers.hasOwnProperty(errorMessage)) {
        return errorHandlers[errorMessage]()
      } else {
        return updateNonce()
      }
    }
  }

  const from = address
  const gas = await method.estimateGas({ from })
  const gasPrice = await getGasPrice(bridgeType, web3)
  const account = await Account.findOne({ address })
  for (let i = 0; i < retries; i++) {
    const response = await doSend(i) || {}
    const { receipt } = response
    if (receipt) {
      account.nonces[bridgeType]++
      await Account.updateOne({ address }, { [`nonces.${bridgeType}`]: account.nonces[bridgeType] })
      receipt.bridgeType = bridgeType
      return receipt
    }
  }
}

const getPrivateKey = (account) => {
  const derivedWallet = wallet.deriveChild(account.childIndex).getWallet()
  const derivedAddress = derivedWallet.getChecksumAddressString()
  if (account.address !== derivedAddress) {
    throw new Error(`Account address does not match with the private key. account address: ${account.address}, derived: ${derivedAddress}`)
  }
  return ethUtils.addHexPrefix(ethUtils.bufferToHex(derivedWallet.getPrivateKey()))
}

const toBufferStripPrefix = (str) => Buffer.from(ethUtils.stripHexPrefix(str), 'hex')

const generateSignature = async (method, methodArguments, privateKey) => {
  const msg = await method(...methodArguments).call()
  const vrs = ethUtils.ecsign(toBufferStripPrefix(msg), toBufferStripPrefix(privateKey))
  return ethUtils.toRpcSig(vrs.v, vrs.r, vrs.s)
}

const signHash = (walletAddr, destinationAddr, value, data, nonce) => {
  let input  = '0x' + [
      '0x19',
      '0x00',
      walletAddr,
      destinationAddr,
      ethers.utils.hexZeroPad(ethers.utils.hexlify(value), 32),
      data,
      ethers.utils.hexZeroPad(ethers.utils.hexlify(nonce), 32)
  ].map(hex => hex.slice(2)).join("")

  let signHash = sha3(input)

  return signHash
}

const sha3 = (input) => {
  if (ethers.utils.isHexString(input)) {
    return ethers.utils.keccak256(input)
  }
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(input))
}

const signMultiSig = async (web3, account, multiSigContract, contractAddress, data) => {
  // Get the nonce
  const nonce = (await multiSigContract.methods.nonce().call()).toNumber()

  // Get the sign Hash
  let hash = signHash(multiSigContract.address, contractAddress, 0, data, nonce)

  // // Get the off chain signature
  const signHashBuffer = Buffer.from(hash.slice(2), 'hex')
  const signature = web3.eth.accounts.sign(signHashBuffer, getPrivateKey(account))

  return signature.signature
}

module.exports = {
  createWeb3,
  generateSignature,
  signMultiSig,
  createContract,
  createMethod,
  send,
  createNetwork
}
