process.env.NODE_ENV = 'test'

const mongoose = require('mongoose')
const config = require('config')
const utils = require('../../utils/community')

const ColuLocalNetwork = artifacts.require('cln-solidity/contracts/ColuLocalNetwork.sol')
const CurrencyFactory = artifacts.require('cln-solidity/contracts/CurrencyFactory.sol')
const EllipseMarketMakerLib = artifacts.require('cln-solidity/contracts/EllipseMarketMakerLib.sol')

const TOKEN_DECIMALS = 10 ** 18
const CLN_MAX_TOKENS = 15 * 10 ** 8 * TOKEN_DECIMALS
const CC_MAX_TOKENS = 15 * 10 ** 6 * TOKEN_DECIMALS

let currencyFactory, cln, metadataHash, ccAddress, communityData

const clearCollections = async () => {
  for (let collection in mongoose.connection.collections) {
    console.log('clear collection', collection)
    await mongoose.connection.collections[collection].remove({})
  }
}

const assertCommunityData = (comm1, comm2) => {
  assert.equal(comm1.ccAddress, comm2.ccAddress)
  assert.equal(comm1.factoryAddress, comm2.factoryAddress)
  assert.equal(comm1.factoryType, comm2.factoryType)
  assert.equal(comm1.factoryVersion, comm2.factoryVersion)
  assert.equal(comm1.mmAddress, comm2.mmAddress)
}

contract('Community', async (accounts) => {
  before(async () => {
    await mongoose.connect(config.get('mongo.uri'), config.get('mongo.options'))
    await clearCollections()

    const mmLib = await EllipseMarketMakerLib.new()

    cln = await ColuLocalNetwork.new(CLN_MAX_TOKENS)
    await cln.makeTokensTransferable()

    currencyFactory = await CurrencyFactory.new(mmLib.address, cln.address, {from: accounts[0]})
  })

  it('should get community data', async () => {
    let tokenURI = 'ipfs://' + metadataHash
    const result = await currencyFactory.createCurrency('TestLocalCurrency', 'TLC', 18, CC_MAX_TOKENS, tokenURI, {from: accounts[0]})
    ccAddress = result.logs[0].args.token
    const owner = result.logs[0].args.owner
    let mmAddress = await currencyFactory.getMarketMakerAddressFromToken(ccAddress)
    communityData = await utils.getCommunityData(currencyFactory.address, ccAddress)
    communityData = {...communityData, owner}
    console.log(communityData)
    assertCommunityData(communityData, {
      ccAddress: ccAddress,
      factoryAddress: currencyFactory.address,
      factoryType: 'CurrencyFactory',
      factoryVersion: 0,
      mmAddress: mmAddress
    })
  })

  it('should insert communityData to DB', async () => {
    let dbData = await utils.addNewCommunity(communityData)
    assertCommunityData(communityData, dbData)
  })

  it('should return currect data from db', async () => {
    let dbData = await mongoose.community.getByccAddress(ccAddress)
    assertCommunityData(communityData, dbData)
  })
})
