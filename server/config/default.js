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
          return this.network.foreign.name === 'mainnet' ? 1 : 3
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
  network: {
    misc: {
      pageSize: 1000,
      minGasLimit: 50000
    },
    home: {
      name: 'fuse',
      bridgeType: 'home',
      contract: {
        options: {
          transactionConfirmationBlocks: 2
        }
      },
      provider: 'http://rpc.fuse.io',
      addressesMainnet: {
        HomeBridgeFactory: '0x93EF4d4032E053978aA71792Efd05d8b583a2B78',
        SimpleListFactory: '0x9FA04c6fc70B0ae20dAD9D7b36161bf1EdcbA0E2',
        BridgeMapper: '0x41063a48F46EE7E20E7EbAd0185992724B4Ee56c'
      },
      addressesRopsten: {
        HomeBridgeFactory: '0xf01c10D1253061164153116925B7a9b11b0D903C',
        SimpleListFactory: '0x9FA04c6fc70B0ae20dAD9D7b36161bf1EdcbA0E2',
        BridgeMapper: '0x0f4b2805522c471191f6a605B4E4795bb571e053',
        UsersRegistry: '0xD54C1B417502CDe8275cBf91B0A8dC820ccb8054'
      },
      addresses: defer(function () {
        if (this.network.foreign.name === 'mainnet') {
          return this.network.home.addressesMainnet
        } else {
          return this.network.home.addressesRopsten
        }
      })
    },
    foreign: {
      name: 'ropsten',
      bridgeType: 'foreign',
      contract: {
        options: {
          transactionConfirmationBlocks: 2
        }
      },
      provider: defer(function () {
        return `https://${this.network.foreign.name}.infura.io/v3/${this.network.foreign.apiKey}`
      }),
      addressesMainnet: {
        ColuLocalNetwork: '0x4162178B78D6985480A308B2190EE5517460406D',
        TokenFactory: '0xac051e086FD2046FC75A53D38088B4DD6e00E25b',
        ForeignBridgeFactory: '0xE600496e0267D6b7AFDb62f83D46062199f0B0d7'
      },
      addressesRopsten: {
        ColuLocalNetwork: '0x41C9d91E96b933b74ae21bCBb617369CBE022530',
        TokenFactory: '0xE307a14b078030d81801e46F89285dbf5B4aa3F0',
        ForeignBridgeFactory: '0x4197122e1ff952D2BaEd1Fe8C10779fc9fd9dBCb'
      },
      addresses: defer(function () {
        if (this.network.foreign.name === 'mainnet') {
          return this.network.foreign.addressesMainnet
        } else {
          return this.network.foreign.addressesRopsten
        }
      }),
      gasStation: 'https://gasprice.poa.network/'
    }
  },
  mongo: {
    uri: 'mongodb://localhost/CLN-community-app',
    debug: true,
    options: {
      useNewUrlParser: true
    }
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
    startPeriodicTasks: true,
    tasks: {
      deploy: {
        concurrency: 5
      }
    }
  }
}
