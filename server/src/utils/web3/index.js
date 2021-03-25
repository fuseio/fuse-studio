const Web3 = require('web3')
const ethUtils = require('ethereumjs-util')
const ethers = require('ethers')
const config = require('config')
const { fromMasterSeed } = require('ethereumjs-wallet/hdkey')
const { inspect } = require('util')
const bip39 = require('bip39')
const studioWallet = fromMasterSeed(config.get('secrets.accounts.seed'))
const funderWallet = fromMasterSeed(bip39.mnemonicToSeedSync(config.get('secrets.accounts.funderSeed')))

const { send } = require('./send')

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
  const contract = new web3.eth.Contract(abi, address)
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

const getDerivedWallet = (account) => {
  const wallet = account.role === 'funder' ? funderWallet : studioWallet
  if (account.role === 'funder') {
    return wallet.derivePath(account.hdPath).getWallet()
  } else {
    return wallet.deriveChild(account.childIndex).getWallet()
  }
}

const getPrivateKey = (account) => {
  const derivedWallet = getDerivedWallet(account)
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
  createNetwork,
  generateSalt,
  send
}
