const Web3 = require('web3')
const config = require('config')
const ForeignBridgeFactoryABI = require('@constants/abi/ForeignBridgeFactory.js')
const HomeBridgeFactoryABI = require('@constants/abi/HomeBridgeFactory.js')
const BridgeMapperABI = require('@constants/abi/BridgeMapper.js')
const foreignAddressess = require('@utils/network').addresses
const homeAddresses = config.get('web3.addresses.fuse')

const TOKEN_DECIMALS = 18
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

function extractEvent (abi, eventName) {
  for (let abiObject of abi) {
    if (abiObject.type === 'event' && abiObject.name === eventName) {
      return abiObject
    }
  }
}

const HomeBridgeDeployedEventAbi = extractEvent(HomeBridgeFactoryABI, 'HomeBridgeDeployed')

const createWeb3 = (providerUrl) => {
  const web3 = new Web3(providerUrl)
  const account = web3.eth.accounts.wallet.add(config.get('secrets.privateKey'))
  return {from: account.address, web3}
}

async function deployForeignBridge (token) {
  console.log('Deploying foreign bridge using factory')
  const {from, web3} = createWeb3(config.get('web3.provider'))
  const foreignFactory = new web3.eth.Contract(ForeignBridgeFactoryABI, foreignAddressess.ForeignBridgeFactory)

  const method = foreignFactory.methods.deployForeignBridge(token.address)

  const gas = await method.estimateGas({
    from
  })

  const p = method.send({
    gas,
    from
  })

  const receipt = await p

  const event = receipt.events.ForeignBridgeDeployed
  const result = {
    foreignBridgeAdderss: event.returnValues._foreignBridge,
    foreignBridgeBlockNumber: event.returnValues._blockNumber
  }

  console.log(result)

  return result
}

function extractHomeBridgeData (web3, receipt) {
  const log = receipt.logs[receipt.logs.length - 1]
  const event = web3.eth.abi.decodeLog(HomeBridgeDeployedEventAbi.inputs, log.data, log.topics)

  const result = {
    homeBridgeAddress: event._homeBridge,
    homeBridgeBlockNumber: event._blockNumber,
    homeBridgeToken: event._token
  }
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
  const data = method.encodeABI()

  const receipt = await web3.eth.sendTransaction({
    from,
    to: homeAddresses.HomeBridgeFactory,
    gas,
    gasPrice: '1000000000',
    data
  })

  const result = extractHomeBridgeData(web3, receipt)

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
  const data = method.encodeABI()

  const receipt = await web3.eth.sendTransaction({
    from,
    to: homeAddresses.BridgeMapper,
    gas,
    gasPrice: '1000000000',
    data
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

  const { foreignBridgeAdderss, foreignBridgeBlockNumber } = deployForeignBridgeResponse
  const { homeBridgeAddress, homeBridgeToken, homeBridgeBlockNumber } = deployHomeBridgeResponse

  const foreignBridgeToken = token.address
  await addBridgeMapping(
    foreignBridgeToken,
    homeBridgeToken,
    foreignBridgeAdderss,
    homeBridgeAddress,
    foreignBridgeBlockNumber,
    homeBridgeBlockNumber
  )

  return {
    foreignBridgeToken,
    homeBridgeToken,
    foreignBridgeAdderss,
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
