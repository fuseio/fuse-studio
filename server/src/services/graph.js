const { GraphQLClient } = require('graphql-request')
const config = require('config')

const bridgeClient = new GraphQLClient(config.get('graph.fuse.subgraphs.bridgeMain'))
const fuseClient = new GraphQLClient(config.get('graph.fuse.subgraphs.fuse'))
const uniswapClient = new GraphQLClient(config.get('graph.uniswap.url'))
const fuseBlocksClient = new GraphQLClient(config.get('graph.fuse.subgraphs.blocks'))

module.exports = {
  bridgeClient,
  fuseClient,
  uniswapClient,
  fuseBlocksClient
}
