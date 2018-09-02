process.env.NODE_ENV = 'test'

const mongoose = require('mongoose')
const config = require('config')
const utils = require('../utils')

const ColuLocalNetwork = artifacts.require('cln-solidity/contracts/ColuLocalNetwork.sol')
const CurrencyFactory = artifacts.require('cln-solidity/contracts/CurrencyFactory.sol')
const EllipseMarketMakerLib = artifacts.require('cln-solidity/contracts/EllipseMarketMakerLib.sol')

const TOKEN_DECIMALS = 10 ** 18
const CLN_MAX_TOKENS = 15 * 10 ** 8 * TOKEN_DECIMALS
const CC_MAX_TOKENS = 15 * 10 ** 6 * TOKEN_DECIMALS

const testMetada = {
  some: 'value',
  num: 3
}

let currencyFactory, cln, metadataAns, metadataHash, ccAddress, communityData

const clearCollections = async () => {
  for (let collection in mongoose.connection.collections) {
    console.log('clear collection', collection)
    await mongoose.connection.collections[collection].remove({})
  }
}

const assertEqualMetadata = (meta1, meta2) => {
  assert.equal(meta1.hash, meta2.hash)
  assert.equal(meta1.protocol, meta2.protocol)
  Object.entries(meta1, async key => {
    assert.equal(meta1[key], meta2[key])
  })
}

const assertCommunityData = (comm1, comm2) => {
  assert.equal(comm1.ccAddress, comm2.ccAddress)
  assert.equal(comm1.factoryAddress, comm2.factoryAddress)
  assert.equal(comm1.factoryType, comm2.factoryType)
  assert.equal(comm1.factoryVersion, comm2.factoryVersion)
  assert.equal(comm1.mmAddress, comm2.mmAddress)
}

contract('COMMUNITY', async (accounts) => {
  before(async () => {
    this.timeout(60000)

    await mongoose.connect(config.get('mongo.uri'), config.get('mongo.options'))
    await clearCollections()

    const mmLib = await EllipseMarketMakerLib.new()

    cln = await ColuLocalNetwork.new(CLN_MAX_TOKENS)
    await cln.makeTokensTransferable()

    currencyFactory = await CurrencyFactory.new(mmLib.address, cln.address, {from: accounts[0]})
  })

  it('should add metadata', async () => {
    metadataAns = await utils.addMetadata(testMetada)
    metadataHash = metadataAns.data.hash
    let dbAns = (await mongoose.metadata.getByHash(metadataHash)).toJSON()
    assertEqualMetadata(metadataAns.data, dbAns)
  })

  it('should add same metadata twice', async () => {
    metadataAns = await utils.addMetadata(testMetada)
    metadataHash = metadataAns.data.hash
    let dbAns = (await mongoose.metadata.getByHash(metadataHash)).toJSON()
    assertEqualMetadata(metadataAns.data, dbAns)
  })

  it('should get the metadadata from db/ipfs', async () => {
    let dbAns = await utils.getMetadata('ipfs', metadataHash)
    assertEqualMetadata(metadataAns.data, dbAns.data)
  })

  it('should get community data', async () => {
    let tokenURI = 'ipfs://' + metadataHash
    const result = await currencyFactory.createCurrency('TestLocalCurrency', 'TLC', 18, CC_MAX_TOKENS, tokenURI, {from: accounts[0]})
    ccAddress = result.logs[0].args.token
    let mmAddress = await currencyFactory.getMarketMakerAddressFromToken(ccAddress)
    communityData = await utils.getCommunityData(currencyFactory.address, ccAddress)
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
