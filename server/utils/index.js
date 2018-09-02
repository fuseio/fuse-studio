const to = require('await-to-js').to
const mongoose = require('mongoose')
const config = require('config')
const IpfsAPI = require('ipfs-api')
const Web3 = require('web3')
const contract = require('truffle-contract')

const DEFAULT_FACTORY_TYPE = 'CurrencyFactory'
const DEFAULT_FACTORY_VERSION = 0

require('../models')(mongoose)
const abis = require('../constants/abi')
// const addresses = require('../constants/addresses')

const ipfsConfig = config.get('ipfs')
const ipfs = new IpfsAPI(ipfsConfig)

const web3Config = config.get('web3')
Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send
const provider = new Web3.providers.HttpProvider(web3Config.provider)

const metadata = mongoose.metadata
const community = mongoose.community

const createContract = (abi) => {
  let cntrct = contract({abi: abi})
  cntrct.setProvider(provider)
  return cntrct
}

const contracts = Object.assign(...Object.entries(abis).map(([name, abi]) => ({[name]: createContract(abi)})))

const utils = {}

utils.later = (delay, value) => {
  return new Promise(resolve => setTimeout(resolve, delay, value))
}

utils.getCommunityData = async (factory, currencyAddress) => {
  const communityData = {
    ccAddress: currencyAddress
  }
  if (typeof factory === 'string') {
    communityData.factoryAddress = factory
    communityData.factoryType = DEFAULT_FACTORY_TYPE
    communityData.factoryVersion = DEFAULT_FACTORY_VERSION
  } else {
    if (!factory.factoryAddress) {
      throw new Error('No factory given')
    }
    communityData.factoryAddress = factory.factoryAddress
    communityData.factoryType = factory.factoryType || DEFAULT_FACTORY_TYPE
    communityData.factoryVersion = factory.factoryVersion || DEFAULT_FACTORY_VERSION
  }
  const factoryInstance = await contracts[communityData.factoryType].at(communityData.factoryAddress)
  communityData.mmAddress = await factoryInstance.getMarketMakerAddressFromToken(currencyAddress)
  return communityData
}

utils.addNewCommunity = async (data) => {
  return community.create(data)
}

utils.getMetadata = async (protocol, hash) => {
  if (protocol === 'ipfs') {
    let data = await Promise.race([
      ipfs.files.cat(hash),
      utils.later(ipfsConfig.timeout)
    ])
    if (!data) {
      const metadataObj = await metadata.getByProtocolAndHash(protocol, hash)
      return {source: 'mongo', data: metadataObj.toJSON()}
    }
    return {source: 'ipfs', data: {hash, protocol, metadata: JSON.parse(data.toString())}}
  } else {
    const metadataObj = await metadata.getByProtocolAndHash(protocol, hash)
    return {source: 'mongo', data: metadataObj.toJSON()}
  }
}

utils.addMetadata = async (md) => {
  const metadataBuf = Buffer.from(JSON.stringify(md))
  const filesAdded = await ipfs.files.add(metadataBuf)
  const hash = filesAdded[0].hash

  let metadataObj = {
    hash,
    metadata: metadataBuf,
    protocol: 'ipfs'
  }

  let [error] = await to(metadata.create(metadataObj))
  metadataObj.metadata = JSON.parse(metadataObj.metadata.toString())
  // duplication error, someone already added this hash to db
  if (error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      return {data: metadataObj}
    }
    throw error
  }
  return {data: metadataObj}
}

module.exports = utils
