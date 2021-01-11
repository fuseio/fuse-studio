const { GraphQLClient } = require('graphql-request')
const { capitalize } = require('lodash')
const config = require('config')
const { toShortName } = require('@utils/network')

const bridgeClient = new GraphQLClient(`${config.get('graph.fuse.url')}${config.get(`graph.fuse.subgraphs.bridge${capitalize(toShortName(config.get(`network.foreign.name`)))}`)}`)
const fuseClient = new GraphQLClient(`${config.get('graph.fuse.url')}${config.get('graph.fuse.subgraphs.fuse')}`)
const uniswapClient = new GraphQLClient(`${config.get('graph.uniswap.url')}`)

module.exports = {
  bridgeClient,
  fuseClient,
  uniswapClient
}
