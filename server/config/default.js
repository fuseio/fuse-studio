const defer = require('config/defer').deferConfig

module.exports = {
  api: {
    secret: 'secret',
    port: 3000
  },
  ipfs: {
    host: '127.0.0.1',
    port: 5001,
    protocol: 'http',
    timeout: 3000
  },
  web3: {
    provider: defer(function () {
      return `https://${this.web3.network}.infura.io/v3/${this.web3.apiKey}`
    }),
    websocketProvider: defer(function () {
      return `wss://${this.web3.network}.infura.io/ws/v3/${this.web3.apiKey}`
    }),
    network: 'ropsten',
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
