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
        chainId: defer(function () {
          return this.web3.network === 'mainnet' ? 1 : 3
        }),
        version: 1
      }
    }
  },
  aws: {
    secrets: {
      manager: {
        region: 'eu-west-1'
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
    fuseProvider: 'http://rpc.fuse.io',
    network: 'ropsten',
    pageSize: 1000,
    addresses: {
      ropsten: {
        ColuLocalNetwork: '0x41C9d91E96b933b74ae21bCBb617369CBE022530',
        CurrencyFactory: '0xA1F05144f9d3298a702c8EEE3ca360bc87d05207',
        TokenFactory: '0x824E01Cf7013f459Aa010D73627B006a8740b183',
        ForeignBridgeFactory: '0x7D913f6F0bA5Cc0660d8F60Df894b01F272550A0'
      },
      mainnet: {
        ColuLocalNetwork: '0x4162178B78D6985480A308B2190EE5517460406D',
        CurrencyFactory: '0xE3e3bed21fC39d0915f66509eD0AAc05dB6d6454',
        TokenFactory: '0xac051e086FD2046FC75A53D38088B4DD6e00E25b'
      },
      fuse: {
        HomeBridgeFactory: '0xFb5CC1688Ec06c57cbAB6cC34c33413154A666Fa',
        BridgeMapper: '0x9cb2820EA169D37aFa13C097776bDDB9b19d3C14'
      }
    }
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
  },
  agenda: {
    start: true
  }
}
