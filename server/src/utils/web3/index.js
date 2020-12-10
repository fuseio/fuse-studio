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
const { get } = require('lodash')
const BigNumber = require('bignumber.js')

const calculateTxFee = ({ gasUsed, gasPrice }) => {
  return new BigNumber(gasUsed).multipliedBy(gasPrice).toString()
}

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
  console.log(`creating contract for address ${address}`)
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
    bridgeType,
    networkType: config.get(`network.${bridgeType}.name`),
    web3,
    createContract: createContract.bind(null, { web3, bridgeType, address: from }),
    createMethod,
    send: send.bind(null, { web3, bridgeType, address: from })
  }
}

const getMethodName = (method) => method ? get(method, 'methodName', 'unknown') : 'raw'

const getGasPrice = async (bridgeType, web3) => {
  if (config.has(`network.${bridgeType}.gasPrice`)) {
    return config.get(`network.${bridgeType}.gasPrice`)
  }
  const gasPrice = await fetchGasPrice()
  return web3.utils.toWei(gasPrice.toString(), 'gwei')
}

const retries = 3

const TRANSACTION_HASH_IMPORTED = 'Node error: {"code":-32010,"message":"Transaction with the same hash was already imported."}'
const TRANSACTION_HASH_TOO_LOW = 'Node error: {"code":-32010,"message":"Transaction nonce is too low. Try incrementing the nonce."}'
const TRANSACTION_TIMEOUT = 'Error: Timeout exceeded during the transaction confirmation process. Be aware the transaction could still get confirmed!'

const send = async ({ web3, bridgeType, address }, method, options, handlers) => {
  const doSend = async (retry) => {
    let transactionHash
    const nonce = account.nonces[bridgeType]
    const methodName = getMethodName(method)
    console.log(`[${bridgeType}][retry: ${retry}] sending method ${methodName} from ${from} with nonce ${nonce}. gas price: ${gasPrice}, gas limit: ${gas}, options: ${inspect(options)}`)
    const methodParams = { ...options, gasPrice, gas, nonce, chainId: bridgeType === 'home' ? config.get('network.home.chainId') : undefined }
    if (!method) {
      web3.eth.transactionConfirmationBlocks = parseInt(
        config.get(
          `network.foreign.contract.options.transactionConfirmationBlocks`
        )
      )
    }
    const promise = method ? method.send({ ...methodParams }) : web3.eth.sendTransaction(options)
    promise.on('transactionHash', (hash) => {
      transactionHash = hash
      if (handlers && handlers.transactionHash) {
        handlers.transactionHash(hash)
      }
    })

    try {
      if (methodName === 'deploy') {
        const contract = await promise
        console.log(`[${bridgeType}] method ${methodName} succeeded ${contract.options.address}`)
        return { receipt: contract }
      } else {
        const receipt = await new Promise(async (resolve, reject) => {
          promise
            .on('error', (e, rec) => {
              e.receipt = rec
              reject(e)
            })
            .on('receipt', (r) => resolve(r))
        })
        console.log(`[${bridgeType}] method ${methodName} succeeded in tx ${receipt.transactionHash}`)
        return { receipt }
      }
    } catch (error) {
      console.error(error)

      // reverted: transaction has beed confirmed but failed
      if (error.receipt) {
        return error
      }

      const updateNonce = async () => {
        console.log('updating the nonce')
        const nonce = await web3.eth.getTransactionCount(from)
        console.log(`new nonce is ${nonce}`)
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
      console.error(`[${bridgeType}][retry: ${retry}] sending method ${methodName} from ${from} with nonce ${nonce} failed with ${errorMessage}`)
      if (errorHandlers.hasOwnProperty(errorMessage)) {
        const response = await errorHandlers[errorMessage]()
        return { ...response, error }
      } else {
        console.log('No error handler found, using the default one.')
        await updateNonce()
        return { error }
      }
    }
  }

  const estimateGas = () => options.gas ||
    (method ? method.estimateGas({ from }) : web3.eth.estimateGas(options))

  const from = address
  const gas = await estimateGas()
  const gasPrice = await getGasPrice(bridgeType, web3)
  const account = await Account.findOne({ address })
  for (let i = 0; i < retries; i++) {
    const response = await doSend(i) || {}
    const { receipt, error } = response
    if (receipt) {
      if (!receipt.status) {
        console.warn(`Transaction ${receipt.transactionHash} is reverted`)
      }
      account.nonces[bridgeType]++
      await Account.updateOne({ address }, { [`nonces.${bridgeType}`]: account.nonces[bridgeType] })
      receipt.bridgeType = bridgeType
      receipt.gasPrice = gasPrice
      receipt.txFee = calculateTxFee(receipt)
      return receipt
    }
    if (error && i === retries - 1) {
      throw error
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

const sha3 = (input) => {
  if (ethers.utils.isHexString(input)) {
    return ethers.utils.keccak256(input)
  }
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(input))
}

const signMultiSigHash = (walletAddr, destinationAddr, value, data, nonce) => {
  let input = '0x' + [
    '0x19',
    '0x00',
    walletAddr,
    destinationAddr,
    ethers.utils.hexZeroPad(ethers.utils.hexlify(value), 32),
    data,
    ethers.utils.hexZeroPad(ethers.utils.hexlify(nonce), 32)
  ].map(hex => hex.slice(2)).join('')

  return sha3(input)
}

const signMultiSig = async (web3, account, multiSigContract, contractAddress, data) => {
  // Get the nonce
  const nonce = (await multiSigContract.methods.nonce().call()).toNumber()

  // Get the sign Hash
  let hash = signMultiSigHash(multiSigContract.address, contractAddress, 0, data, nonce)

  // Get the off chain signature
  const signHashBuffer = Buffer.from(hash.slice(2), 'hex')
  const signature = web3.eth.accounts.sign(signHashBuffer, getPrivateKey(account))

  return signature.signature
}

const generateSalt = () => {
  return ethers.utils.bigNumberify(ethers.utils.randomBytes(32)).toHexString()
}

module.exports = {
  createWeb3,
  generateSignature,
  signMultiSig,
  createContract,
  createMethod,
  send,
  createNetwork,
  generateSalt
}
