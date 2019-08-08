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
      chainId: 122,
      contract: {
        options: {
          transactionConfirmationBlocks: 2
        }
      },
      provider: 'https://rpc.fusenet.io',
      addressesMainnet: {
        HomeBridgeFactory: '0x93EF4d4032E053978aA71792Efd05d8b583a2B78',
        BridgeMapper: '0x41063a48F46EE7E20E7EbAd0185992724B4Ee56c'
      },
      addressesRopsten: {
        HomeBridgeFactory: '0xb895638fb3870AD5832402a5BcAa64A044687db0',
        BridgeMapper: '0x3E0d9311E14b8Ba767b8917F3d06D1C178893E66'
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
        FuseToken: '0xcd975c581AA0b83a8dE39035325BF44556517367',
        TokenFactory: '0xac051e086FD2046FC75A53D38088B4DD6e00E25b',
        ForeignBridgeFactory: '0xE600496e0267D6b7AFDb62f83D46062199f0B0d7'
      },
      addressesRopsten: {
        FuseToken: '0xcd975c581AA0b83a8dE39035325BF44556517367',
        TokenFactory: '0xA6D0f4552cf5237987F46095875fC64b006E7bda',
        ForeignBridgeFactory: '0xABBf5D8599B2Eb7b4e1D25a1Fd737FF1987655aD'
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
    uri: 'mongodb://localhost/fuse-studio',
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
      urlBase: 'https://explorer.fusenet.io/api'
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
