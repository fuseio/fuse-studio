const defer = require('config/defer').deferConfig

module.exports = {
  env: 'qa',
  api: {
    allowCors: true,
    secret: 'secret',
    tokenExpiresIn: '30d',
    port: 3000,
    auth: {
      domain: {
        name: 'Fuse Studio Dev',
        chainId: defer(function () {
          return this.network.foreign.name === 'mainnet' ? 1 : 3
        }),
        version: 1
      },
      google: {
        clientId: '35920459637-u2pvmrs28odma6sa2aepclhk91tv9d86.apps.googleusercontent.com'
      }
    }
  },
  ipfsProxy: {
    urlBase: 'http://localhost:4000/api'
  },
  graph: {
    url: 'https://graph.fuse.io/subgraphs/name/fuseio/fuse-qa'
  },
  box: {
    graph: {
      url: 'https://api.3box.io/graph'
    }
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
        WalletFactory: '0x8A6C9aBB48fb68bFe240c0e61DFE7Cc273023649',
        WalletImplementation: '0x1DA43F87611B7FFDb104D125389E14313e053A3A',
        CommunityFactory: '0x5E853EDAEE70BD635d02CC0169Cf97083DE3436D',
        MultiSigWallet: '0x0f5922B9c866c9d7de3E119c83a0A796A36A1307',
        walletModules: {
          GuardianManager: '0xb2c9B85a41830655C0f21CAe43F552B6D76A709E',
          LockManager: '0xf8C62698F6D2322E04C8bDC386e7B640773715b7',
          RecoveryManager: '0xAC4F70025d0671F88309Db0E588E0565bEFd1f35',
          ApprovedTransfer: '0x04E92d2ffBb51d53379b4754b3b92f879838902A',
          TransferManager: '0x8527a2d3d5aC0411933d663b4dcE275a5b7f39D8',
          TokenExchanger: '0x16127Bbec8d9A24a0801f7B945A18D077f2c629b',
          CommunityManager: '0x42616C787e3D75aC29b9dCAB35131b585Eaa9837',
          WalletOwnershipManager: '0x7C38a5E6c0822623392847f6B827E8ADd75130ae'
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
      useNewUrlParser: true,
      useUnifiedTopology: true
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
    args: {
      maxConcurrency: 5
    },
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
  },
  inviteTxt: 'Hi, a friend has invited you to Fuse',
  inviteTxtEmail: 'Hi, a friend has invited you to Fuse. Please open this link from your mobile device',
  smsProvider: 'sns',
  phoneNumbers: {
    magic: '5555',
    maxUserWallets: 5
  },
  aws: {
    sns: {
      region: 'eu-west-1',
      senderId: 'Wallet',
      smsType: 'Promotional'
    }
  },
  slack: {
    channel: 'monitor'
  },
  alerts: {
    lockedAccounts: {
      threshold: 10 // in minutes
    }
  }
}
