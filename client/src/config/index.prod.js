module.exports = {
  web3: {
    provider: process.env.COMMUNITY_ETHEREUM_PROVIDER
  },
  api: {
    url: process.env.COMMUNITY_API || 'api/v1'
  }
}
