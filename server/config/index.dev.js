module.exports = {
  secret: process.env.COMMUNITY_API_SECRET,
  ipfs: {
    host: process.env.COMMUNITY_IPFS_HOST || 'qa-ipfs.colu.com',
    port: 443,
    protocol: 'https',
    timeout: process.env.COMMUNITY_IPFS_TIMEOUT || 3000
  },
  mongo: {
    uri: process.env.COMMUNITY_MONGO_URI,
    options: {
      user: process.env.COMMUNITY_MONGO_USER,
      pass: process.env.COMMUNITY_MONGO_PASS,
      authSource: process.env.COMMUNITY_MONGO_AUTH_SOURCE
    }
  },
  mandrill: {
    apiKey: process.env.COMMUNITY_MANDRILL_API_KEY,
    sendTo: process.env.COMMUNITY_MANDRILL_SEND_TO
  },
  mailchimp: {
    apiBase: process.env.COMMUNITY_MAILCHIMP_API_BASE,
    list: process.env.COMMUNITY_MAILCHIMP_LIST
  },
  amazon: {
    apiBase: process.env.COMMUNITY_AMAZON_BUCKET_API || 'https://s3-eu-west-1.amazonaws.com/cln-dapp-images-qa/'
  }
}
