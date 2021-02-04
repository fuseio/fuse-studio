const config = require('config')
const ForeignBridgeFactoryABI = require('@constants/abi/ForeignBridgeFactory.json')
const HomeBridgeFactoryABI = require('@constants/abi/HomeBridgeFactory')
const BridgeMapperABI = require('@constants/abi/BridgeMapper')
const IRestrictedTokenABI = require('@constants/abi/IRestrictedToken')
const foreignAddressess = config.get('network.foreign.addresses')
const homeAddresses = config.get('network.home.addresses')
const { generateSignature } = require('@utils/web3')
const { fetchTokenData } = require('@utils/token')
const { handleReceipt } = require('@handlers/receipts')
const mongoose = require('mongoose')
const Token = mongoose.model('Token')
const { setLengthLeft } = require('ethereumjs-util')

async function deployForeignBridge (token, { web3, createContract, createMethod, from, send }) {
  console.log('Deploying foreign bridge using factory')
  const foreignFactory = createContract(ForeignBridgeFactoryABI, foreignAddressess.ForeignBridgeFactory)

  const method = createMethod(foreignFactory, 'deployForeignBridge', token.address)

  const receipt = await send(method, {
    from
  })

  const event = receipt.events.ForeignBridgeDeployed
  const result = {
    foreignBridgeAddress: event.returnValues._foreignBridge,
    foreignBridgeBlockNumber: event.returnValues._blockNumber
  }

  console.log(result)

  return result
}

async function deployHomeBridge (token, { createContract, createMethod, from, send }) {
  console.log('Deploying home bridge using factory')

  const homeFactory = createContract(HomeBridgeFactoryABI, homeAddresses.HomeBridgeFactory)

  const method = createMethod(homeFactory, 'deployHomeBridge', token.name, token.symbol, token.decimals)

  const receipt = await send(method, {
    from
  })

  await handleReceipt(receipt)

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
  communityAddress,
  foreignToken,
  homeToken,
  foreignBridge,
  homeBridge,
  foreignBlockNumber,
  homeBlockNumber,
  { createContract, createMethod, from, send }) {
  console.log('Add bridge mapping')

  const mapper = createContract(BridgeMapperABI, homeAddresses.BridgeMapper)
  const key = setLengthLeft(communityAddress, 32)

  const addBridgeMappingArguments = [
    key,
    foreignToken,
    homeToken,
    foreignBridge,
    homeBridge,
    foreignBlockNumber,
    homeBlockNumber
  ]

  const signature = await generateSignature(
    mapper.methods.getAddBridgeMappingHash,
    addBridgeMappingArguments,
    config.get('secrets.fuse.bridge.privateKey')
  )

  const method = createMethod(mapper, 'addBridgeMapping',
    ...addBridgeMappingArguments,
    signature
  )

  const receipt = await send(method, {
    from
  })

  console.log('Bridge mapping added')
  return receipt
}

async function deployBridge ({ home, foreign }, communityProgress) {
  const { communityAddress } = communityProgress.steps.community.results
  const { foreignTokenAddress, isCustom } = communityProgress.steps.bridge.args
  const { name } = communityProgress.steps.community.args

  let token = await Token.findOne({ address: foreignTokenAddress })
  if (isCustom && !token) {
    console.log(`Adding the custom token ${foreignTokenAddress} to the database`)
    const tokenData = await fetchTokenData(foreignTokenAddress, {}, foreign.web3)
    token = await new Token({ address: foreignTokenAddress, networkType: foreign.networkType, tokenType: 'custom', ...tokenData }).save()
  }

  const [deployForeignBridgeResponse, deployHomeBridgeResponse] = await Promise.all([
    deployForeignBridge(token, foreign),
    deployHomeBridge(
      { name, symbol: token.symbol, decimals: token.decimals },
      home
    )
  ])

  const { foreignBridgeAddress, foreignBridgeBlockNumber } = deployForeignBridgeResponse
  const { homeBridgeAddress, homeTokenAddress, homeBridgeBlockNumber } = deployHomeBridgeResponse

  const receipt = await addBridgeMapping(
    communityAddress,
    foreignTokenAddress,
    homeTokenAddress,
    foreignBridgeAddress,
    homeBridgeAddress,
    foreignBridgeBlockNumber,
    homeBridgeBlockNumber,
    home
  )

  await handleReceipt(receipt)

  const restrictedTokenContract = home.createContract(IRestrictedTokenABI, homeTokenAddress)
  const setTransferManagerMethod = home.createMethod(restrictedTokenContract, 'setTransferManager', communityAddress)

  await home.send(setTransferManagerMethod, {
    from: home.from
  })

  return {
    foreignTokenAddress,
    homeTokenAddress,
    foreignBridgeAddress,
    homeBridgeAddress,
    foreignBridgeBlockNumber,
    homeBridgeBlockNumber
  }
}

module.exports = {
  deployBridge
}
