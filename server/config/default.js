const defer = require('config/defer').deferConfig

module.exports = {
  env: 'qa',
  api: {
    allowCors: true,
    secret: 'secret',
    tokenExpiresIn: '7d',
    port: 3000,
    auth: {
      domain: {
        name: 'Fuse Studio Dev',
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
  graph: {
    url: 'https://graph.fuse.io/subgraphs/name/fuseio/fuse-qa'
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
      gasPrice: '1000000000',
      contract: {
        options: {
          transactionConfirmationBlocks: 2,
          transactionPollingTimeout: 30
        }
      },
      provider: 'https://rpc.fuse.io',
      addressesMainnet: {
        HomeBridgeFactory: '0xFbf20Fa994A577439Cd0b6033Db373f7a995E147',
        BridgeMapper: '0x89b98bB511A41FeF73b388cF8C052221f42cd44f'
      },
      addressesRopsten: {
        HomeBridgeFactory: '0xb895638fb3870AD5832402a5BcAa64A044687db0',
        BridgeMapper: '0x3E0d9311E14b8Ba767b8917F3d06D1C178893E66'
      },
      sharedAddresses: {
        WalletFactory: '0xa7c4381482974Dfa7115728723E684fEAf569f34',
        CommunityFactory: '0x5E853EDAEE70BD635d02CC0169Cf97083DE3436D',
        MultiSigWallet: '0xcdaC5808C030aDF0365066E348e2bc7F7e62f9cD',
        walletModules: {
          GuardianManager: '0xdB0DBa0e819B6813C97B4D4defD664B67012fA8C',
          LockManager: '0xC999068333bE858291A8f5E13DB43612F67689bb',
          RecoveryManager: '0xa4D6ed042480a2B7E31a1754Ac83c48E2AFF347F',
          ApprovedTransfer: '0x34CADc1Db60e55edB8d9adC56616c07d74E89171',
          TransferManager: '0xAA9DFdb49eDa2Cd2d05312286f5E5E17aEd2Cb6D',
          TokenExchanger: '0x993AB36a4D7915abf6d966ED5e9D1DE9afa7c2bA',
          CommunityManager: '0xFEBdd95338AE3dAfe114a4242Ef9a7A8072f73d4',
          WalletOwnershipManager: '0x4E18A4D2510f0a12cA2F10059f51E0a41E46f843'
        }
      },
      addresses: defer(function () {
        if (this.network.foreign.name === 'mainnet') {
          return { ...this.network.home.sharedAddresses, ...this.network.home.addressesMainnet }
        } else {
          return { ...this.network.home.sharedAddresses, ...this.network.home.addressesRopsten }
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
        TokenFactory: '0xB2100946628D3e45FF94971b35508AfCBBc87432',
        ForeignBridgeFactory: '0xaC116929b2baB59D05a1Da99303e7CAEd100ECC9'
      },
      addressesRopsten: {
        TokenFactory: '0x6004EAdF0aD3aCd568F354CA7E2b410bA0080E98',
        ForeignBridgeFactory: '0xABBf5D8599B2Eb7b4e1D25a1Fd737FF1987655aD'
      },
      addresses: defer(function () {
        if (this.network.foreign.name === 'mainnet') {
          return this.network.foreign.addressesMainnet
        } else {
          return this.network.foreign.addressesRopsten
        }
      }),
      gasStation: 'https://ethgasstation.info/json/ethgasAPI.json'
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
      urlBase: 'https://explorer.fuse.io/api'
    }
  },
  agenda: {
    startPeriodicTasks: true,
    tasks: {
      deploy: {
        concurrency: 5
      },
      transfer: {
        concurrency: 1
      },
      startTransfers: {
        concurrency: 1
      }
    }
  },
  funder: {
    urlBase: 'https://funder-qa.fuse.io/api/'
  },
  twilio: {
    inviteTxt: 'Hi, a friend has invited you to Fuse',
    magic: '5555'
  },
  branch: {
    urlBase: 'https://api2.branch.io/v1/',
    key: 'key_live_aaSvQXmuELUQfsYeG4UfWemnqEiq04hr'
  },
  plugins: {
    moonpay: {
      currencies: {
        '0c9480ef-2fab-4d31-9037-da4b29ecc16f': '0x48B0C1D90C3058ab032C44ec52d98633587eE711'
      },
      args: {
      }
    },
    carbon: {
      args: {
      }
    },
    wyre: {
      args: {
      }
    },
    coindirect: {
      args: {
      }
    },
    ramp: {
      args: {
      }
    }
  }
}
