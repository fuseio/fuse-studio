module.exports = {
  secret: process.env.COMMUNITY_API_SECRET,
  ipfs: {
    host: process.env.COMMUNITY_IPFS_HOST || 'qa-ipfs.colu.com',
    port: 443,
    protocol: 'https'
  },
  mongo: {
    uri: process.env.COMMUNITY_MONGO_URI,
    options: {
      user: process.env.COMMUNITY_MONGO_USER,
      pass: process.env.COMMUNITY_MONGO_PASS,
      authSource: process.env.COMMUNITY_MONGO_AUTH_SOURCE
    }
  }
}
