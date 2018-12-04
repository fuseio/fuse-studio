const mongoose = require('mongoose')
const Contract = require('truffle-contract')
const web3 = require('@services/web3')

const DEFAULT_FACTORY_TYPE = 'CurrencyFactory'
const DEFAULT_FACTORY_VERSION = 0

const COLU_LOCAL_CURRENCY = 'ColuLocalCurrency'

require('../models')(mongoose)
const abis = require('../constants/abi')

const community = mongoose.community

const createContract = (abi) => {
  let cntrct = Contract({ abi: abi })
  cntrct.setProvider(web3.currentProvider)
  return cntrct
}

const contracts = Object.assign(...Object.entries(abis).map(([name, abi]) => ({ [name]: createContract(abi) })))

const utils = {}

utils.later = (delay, value) => {
  return new Promise(resolve => setTimeout(resolve, delay, value))
}

utils.getCommunityData = async (factory, tokenAddress) => {
  const communityData = {
    ccAddress: tokenAddress
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
  const factoryContractInstance = await contracts[communityData.factoryType].at(communityData.factoryAddress)
  const tokenContractInstance = await contracts[COLU_LOCAL_CURRENCY].at(tokenAddress)

  const [currencyMap, symbol, tokenURI] = await Promise.all([
    factoryContractInstance.currencyMap(tokenAddress),
    tokenContractInstance.symbol(),
    tokenContractInstance.tokenURI()
  ])

  const {name, decimals, totalSupply, mmAddress} = currencyMap

  return {...communityData, name, totalSupply, decimals, mmAddress, symbol, tokenURI}
}

utils.addNewCommunity = async (data) => {
  return community.create(data)
}

utils.upsertCommunity = async (data) => {
  return community.upsertByccAddress(data)
}

utils.openMarket = async (mmAddress) => {
  const result = await community.updateBymmAddress({mmAddress, openMarket: true})
  if (result.n === 0) {
    throw new Error('The community is not exist yet')
  }
}

utils.getLastBlockNumber = async () => {
  const communityObj = await community.getModel().find().sort({ blockNumber: -1 }).limit(1)
  return communityObj.length ? communityObj[0].blockNumber + 1 : 0
}

module.exports = utils
