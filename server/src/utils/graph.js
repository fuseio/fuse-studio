const config = require('config')
const mongoose = require('mongoose')
const { capitalize, get } = require('lodash')
const { toChecksumAddress } = require('web3-utils')
const { GraphQLClient } = require('graphql-request')
const Community = mongoose.model('Community')
const { toShortName } = require('@utils/network')

const graphBridgeClient = new GraphQLClient(`${config.get('graph.url')}${config.get(`graph.subgraphs.bridge${capitalize(toShortName(config.get(`network.foreign.name`)))}`)}`)
const graphFuseClient = new GraphQLClient(`${config.get('graph.url')}${config.get('graph.subgraphs.fuse')}`)

const fetchTokenByCommunity = async (communityAddress) => {
  const community = await Community.findOne({ communityAddress: toChecksumAddress(communityAddress) }).lean()
  const isMultiBridge = get(community, 'isMultiBridge', false)
  if (isMultiBridge) {
    const { foreignTokenAddress } = community
    const query = `{bridgedTokens(where: {foreignAddress: "${foreignTokenAddress}"}) {address, name}}`
    const { bridgedTokens } = await graphBridgeClient.request(query)
    console.log(`fetch token by community tokenAddress - ${bridgedTokens[0]['address']}`)
    return bridgedTokens[0]
  }
  const query = `{tokens(where: {communityAddress: "${communityAddress}"}) {address, communityAddress, originNetwork}}`
  const { tokens } = await graphFuseClient.request(query)
  console.log(`fetch token by community tokenAddress - ${tokens[0]['address']}`)
  return tokens[0]
}

module.exports = {
  fetchTokenByCommunity
}
