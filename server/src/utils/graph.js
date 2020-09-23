const config = require('config')
const mongoose = require('mongoose')
const lodash = require('lodash')
const web3Utils = require('web3-utils')
const { GraphQLClient } = require('graphql-request')
const Community = mongoose.model('Community')
const { toShortName } = require('@utils/network')

const graphBridgeSubgraphClient = new GraphQLClient(`${config.get('graph.url')}${config.get(`graph.subgraphs.bridge${lodash.capitalize(toShortName(config.get(`network.foreign.name`)))}`)}`)
const graphClient = new GraphQLClient(`${config.get('graph.url')}${config.get('graph.subgraphs.entities')}`)

export const fetchTokenByCommunity = async (communityAddress) => {
  const community = await Community.findOne({ communityAddress: web3Utils.toChecksumAddress(communityAddress) }).lean()
  if (community.isMultiBridge) {
    const { foreignTokenAddress } = community
    const query = `{bridgedTokens(where: {foreignAddress: "${foreignTokenAddress}"}) {address, name}}`
    const { bridgedTokens } = await graphBridgeSubgraphClient.request(query)
    console.log(`fetch token by community tokenAddress - ${bridgedTokens[0]['address']}`)
    return bridgedTokens[0]
  }
  const query = `{tokens(where: {communityAddress: "${communityAddress}"}) {address, communityAddress, originNetwork}}`
  const { tokens } = await graphClient.request(query)
  console.log(`fetch token by community tokenAddress - ${tokens[0]['address']}`)
  return tokens[0]
}

module.exports = {
  fetchTokenByCommunity
}
