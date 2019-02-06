const defer = require('config/defer').deferConfig

module.exports = {
  api: {
    allowCors: true,
    secret: 'secret',
    tokenExpiresIn: '7d',
    port: 3000,
    auth: {
      domain: {
        name: 'CLN Communities Dev',
        chainId: 3,
        version: 1
      }
    }
  },
  ipfsProxy: {
    urlBase: 'http://localhost:4000/api'
  },
  web3: {
    provider: defer(function () {
      return `https://${this.web3.network}.infura.io/v3/${this.web3.apiKey}`
    }),
    websocketProvider: defer(function () {
      return `wss://${this.web3.network}.infura.io/ws/v3/${this.web3.apiKey}`
    }),
    network: 'ropsten',
    chainId: 3,
    pageSize: 1000
  },
  mongo: {
    uri: 'mongodb://localhost/CLN-community-app',
    debug: true,
    options: {}
  },
  mail: {
    sendgrid: {
      templates: {}
    }
  },
  amazon: {
    apiBase: 'https://s3-eu-west-1.amazonaws.com/cln-dapp-images-qa/'
  }
}
