const config = require('config')
const mongoose = require('mongoose')
const { isEmpty } = require('lodash')
const { toChecksumAddress } = require('web3-utils')
const { GraphQLClient } = require('graphql-request')
const Community = mongoose.model('Community')

const graphEthereumBridgeClient = new GraphQLClient(`${config.get('graph.url')}${config.get(`graph.subgraphs.bridgeRopsten`)}`)
const graphRopstenBridgeClient = new GraphQLClient(`${config.get('graph.url')}${config.get(`graph.subgraphs.bridgeRopsten`)}`)
const graphFuseEntitiesClient = new GraphQLClient(`${config.get('graph.url')}${config.get('graph.subgraphs.entities')}`)

export const fetchTokenByCommunity = async (communityAddress) => {
  const community = await Community.findOne({ communityAddress: toChecksumAddress(communityAddress) }).lean()
  if (community.isMultiBridge) {
    const { foreignTokenAddress } = community
    const query = `{bridgedTokens(where: {foreignAddress: "${foreignTokenAddress}"}) {address, name}}`
    const [bridgedTokensEthereum, bridgedTokensRopsten] = await Promise.all([
      graphEthereumBridgeClient.request(query),
      graphRopstenBridgeClient.request(query)
    ])
    const bridgedTokens = isEmpty(bridgedTokensRopsten) ? bridgedTokensEthereum : bridgedTokensRopsten
    console.log(`fetch token by community tokenAddress - ${bridgedTokens[0]['address']}`)
    return bridgedTokens[0]
  }
  const query = `{tokens(where: {communityAddress: "${communityAddress}"}) {address, communityAddress, originNetwork}}`
  const { tokens } = await graphFuseEntitiesClient.request(query)
  console.log(`fetch token by community tokenAddress - ${tokens[0]['address']}`)
  return tokens[0]
}

module.exports = {
  fetchTokenByCommunity
}
