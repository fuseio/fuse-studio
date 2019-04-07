const Web3 = require('web3')
const config = require('config')
const ForeignBridgeFactoryABI = require('@constants/abi/ForeignBridgeFactory.js')
const HomeBridgeFactoryABI = require('@constants/abi/HomeBridgeFactory.js')
const BridgeMapperABI = require('@constants/abi/BridgeMapper.js')
const foreignAddressess = require('@utils/network').addresses
const homeAddresses = config.get('web3.addresses.fuse')
const fetchGasPrice = require('@utils/network').fetchGasPrice
const handleReceipt = require('@events/handlers').handleReceipt

const TOKEN_DECIMALS = 18
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const createWeb3 = (providerUrl) => {
  const web3 = new Web3(providerUrl)
  const account = web3.eth.accounts.wallet.add(add0xPrefix(config.get('secrets.fuse.bridge.privateKey')))
  return {from: account.address, web3}
}

function add0xPrefix (str) {
  if (str.indexOf('0x') === 0) {
    return str
  }

  return `0x${str}`
}

async function deployForeignBridge (token) {
  console.log('Deploying foreign bridge using factory')
  const {from, web3} = createWeb3(config.get('web3.provider'))
  const foreignFactory = new web3.eth.Contract(ForeignBridgeFactoryABI, foreignAddressess.ForeignBridgeFactory)

  const method = foreignFactory.methods.deployForeignBridge(token.address)

  const [gas, gasPrice] = await Promise.all([
    method.estimateGas({
      from
    }),
    fetchGasPrice('standard')
  ])

  const p = method.send({
    gas,
    from,
    gasPrice: web3.utils.toWei(gasPrice.toString(), 'gwei')
  })

  const receipt = await p

  const event = receipt.events.ForeignBridgeDeployed
  const result = {
    foreignBridgeAddress: event.returnValues._foreignBridge,
    foreignBridgeBlockNumber: event.returnValues._blockNumber
  }

  console.log(result)

  return result
}

async function deployHomeBridge (token) {
  console.log('Deploying home bridge using factory')
  const {from, web3} = createWeb3(config.get('web3.fuseProvider'))

  const homeFactory = new web3.eth.Contract(HomeBridgeFactoryABI, homeAddresses.HomeBridgeFactory, {
    from
  })

  const method = homeFactory.methods.deployHomeBridge(token.name, token.symbol, TOKEN_DECIMALS)
  const gas = await method.estimateGas()

  const receipt = await method.send({
    from,
    gas,
    gasPrice: '1000000000'
  })

  const event = receipt.events.HomeBridgeDeployed

  const result = {
    homeBridgeAddress: event.returnValues._homeBridge,
    homeBridgeBlockNumber: event.returnValues._blockNumber,
    homeTokenAddress: event.returnValues._token
  }

  console.log(result)

  return result
}

async function addBridgeMapping (
  foreignToken,
  homeToken,
  foreignBridge,
  homeBridge,
  foreignBlockNumber,
  homeBlockNumber) {
  console.log('Add bridge mapping')
  const {from, web3} = createWeb3(config.get('web3.fuseProvider'))

  const mapper = new web3.eth.Contract(BridgeMapperABI, homeAddresses.BridgeMapper, {
    from
  })

  const method = mapper.methods.addBridgeMapping(
    foreignToken,
    homeToken,
    foreignBridge,
    homeBridge,
    foreignBlockNumber,
    homeBlockNumber
  )

  const gas = await method.estimateGas()

  const receipt = await method.send({
    from,
    gas,
    gasPrice: '1000000000'
  })

  console.log('Bridge mapping added')
  return receipt
}

async function deployBridge (token) {
  const [deployForeignBridgeResponse, deployHomeBridgeResponse] = await Promise.all([
    deployForeignBridge(token),
    deployHomeBridge(
      token
    )
  ])

  const { foreignBridgeAddress, foreignBridgeBlockNumber } = deployForeignBridgeResponse
  const { homeBridgeAddress, homeTokenAddress, homeBridgeBlockNumber } = deployHomeBridgeResponse

  const foreignTokenAddress = token.address
  const receipt = await addBridgeMapping(
    foreignTokenAddress,
    homeTokenAddress,
    foreignBridgeAddress,
    homeBridgeAddress,
    foreignBridgeBlockNumber,
    homeBridgeBlockNumber
  )

  await handleReceipt(receipt)

  return {
    foreignTokenAddress,
    homeTokenAddress,
    foreignBridgeAddress,
    homeBridgeAddress,
    foreignBridgeBlockNumber,
    homeBridgeBlockNumber
  }
}

async function bridgeMappingExists (tokenAddress) {
  const {web3} = createWeb3(config.get('web3.fuseProvider'))
  const mapper = new web3.eth.Contract(BridgeMapperABI, homeAddresses.BridgeMapper)
  const homeAddress = await mapper.methods.homeTokenByForeignToken(tokenAddress).call()
  return homeAddress && homeAddress !== ZERO_ADDRESS
}

module.exports = {
  deployBridge,
  bridgeMappingExists
}
