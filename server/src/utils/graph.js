const mongoose = require('mongoose')
const { get } = require('lodash')
const { toChecksumAddress } = require('web3-utils')
const Community = mongoose.model('Community')
const { bridgeClient, fuseClient } = require('@services/graph')

const fetchTokenByCommunity = async (communityAddress) => {
  const community = await Community.findOne({ communityAddress: toChecksumAddress(communityAddress) }).lean()
  const isMultiBridge = get(community, 'isMultiBridge', false)
  console.log(`fetch token by community - isMultiBridge ${isMultiBridge}`)
  if (isMultiBridge) {
    const { foreignTokenAddress } = community
    const query = `{bridgedTokens(where: {foreignAddress: "${foreignTokenAddress}"}) {address, name}}`
    const { bridgedTokens } = await bridgeClient.request(query)
    console.log(`fetch token by community tokenAddress - ${bridgedTokens[0]['address']}`)
    return bridgedTokens[0]
  }
  const query = `{tokens(where: {communityAddress: "${communityAddress}"}) {address, communityAddress, originNetwork}}`
  const { tokens } = await fuseClient.request(query)
  console.log(`fetch token by community tokenAddress - ${tokens[0]['address']}`)
  return tokens[0]
}

const fetchBridgedTokenPairs = async () => {
  const query = `{bridgedTokens {address, foreignAddress, symbol}}`
  const { bridgedTokens } = await bridgeClient.request(query)
  return bridgedTokens
}

module.exports = {
  fetchTokenByCommunity,
  fetchBridgedTokenPairs
}
