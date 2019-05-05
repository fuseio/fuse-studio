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
    gasStation: 'https://gasprice.poa.network/',
    fuseProvider: 'http://rpc.fuse.io',
    network: 'ropsten',
    pageSize: 1000,
    addresses: {
      ropsten: {
        ColuLocalNetwork: '0x41C9d91E96b933b74ae21bCBb617369CBE022530',
        TokenFactory: '0xE307a14b078030d81801e46F89285dbf5B4aa3F0',
        ForeignBridgeFactory: '0x7D913f6F0bA5Cc0660d8F60Df894b01F272550A0'
      },
      mainnet: {
        ColuLocalNetwork: '0x4162178B78D6985480A308B2190EE5517460406D',
        TokenFactory: '0xac051e086FD2046FC75A53D38088B4DD6e00E25b',
        ForeignBridgeFactory: '0xE600496e0267D6b7AFDb62f83D46062199f0B0d7'
      },
      fuse: defer(function () {
        if (this.web3.network === 'mainnet') {
          return {
            HomeBridgeFactory: '0x93EF4d4032E053978aA71792Efd05d8b583a2B78',
            SimpleListFactory: '0x9FA04c6fc70B0ae20dAD9D7b36161bf1EdcbA0E2',
            BridgeMapper: '0x41063a48F46EE7E20E7EbAd0185992724B4Ee56c'
          }
        } else {
          return {
            HomeBridgeFactory: '0xFb5CC1688Ec06c57cbAB6cC34c33413154A666Fa',
            SimpleListFactory: '0x9FA04c6fc70B0ae20dAD9D7b36161bf1EdcbA0E2',
            BridgeMapper: '0x9cb2820EA169D37aFa13C097776bDDB9b19d3C14'
          }
        }
      })
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
  explorer: {
    fuse: {
      urlBase: 'https://explorer.fuse.io/api'
    }
  },
  agenda: {
    start: true
  }
}
