const config = require('config')
const mongoose = require('mongoose')
const lodash = require('lodash')
const { GraphQLClient } = require('graphql-request')
const Community = mongoose.model('Community')
const web3Utils = require('web3-utils')

const graphBridgeSubgraphClient = new GraphQLClient(`${config.get('graph.url')}${config.get(`graph.subgraphs[bridge${lodash.capitalize(config.get(`network.foreign.name`))}]`)}`)
const graphClient = new GraphQLClient(`${config.get('graph.url')}${config.get('graph.subgraphs.entities')}`)

export const fetchTokenByCommunity = async (communityAddress) => {
  const community = await Community.findOne({ communityAddress: web3Utils.toChecksumAddress(communityAddress) })
  if (community.isMultiBridge) {
    const { foreignTokenAddress } = community
    const query = `{bridgedTokens(where: {foreignAddress: "${foreignTokenAddress}"}) {address}}`
    const { bridgedTokens } = await graphBridgeSubgraphClient.request(query)
    return bridgedTokens[0]
  }
  const query = `{tokens(where: {communityAddress: "${communityAddress}"}) {address, communityAddress, originNetwork}}`
  const { tokens } = await graphClient.request(query)
  return tokens[0]
}

module.exports = {
  fetchTokenByCommunity
}
