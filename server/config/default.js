const defer = require('config/defer').deferConfig

module.exports = {
  env: 'dev',
  mode: 'app',
  api: {
    allowCors: true,
    secret: 'secret',
    tokenExpiresIn: '7d',
    protocol: 'http',
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
        clientId: '784912570329-hkc327u95ps4ia7ja70s8mkhb6kphrbd.apps.googleusercontent.com'
      }
    }
  },
  ipfsProxy: {
    urlBase: 'http://localhost:4000/api'
  },
  graph: {
    fuse: {
      subgraphs: {
        fuse: 'https://api.thegraph.com/subgraphs/name/fuseio/fuse',
        entities: 'https://api.thegraph.com/subgraphs/name/fuseio/fuse-entities',
        bridgeMain: 'https://api.thegraph.com/subgraphs/name/fuseio/fuse-ethereum-bridged-tokens',
        blocks: 'https://api.thegraph.com/subgraphs/name/fuseio/fuse-blocks'
      }
    },
    uniswap: {
      url: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2'
    }
  },
  gasLimitForTx: {
    createForeignWallet: 550000,
    relay: 1500000,
    funder: 21000,
    getDAIPointsToAddress: 1000000
  },
  box: {
    graph: {
      url: 'https://api.3box.io/graph'
    }
  },
  subscriptionServices: {
    blocknative: {
      url: 'https://api.blocknative.com',
      apiKey: ''
    },
    fuse: {
      transport: 'http',
      url: 'https://subscription.fuse.io/api/v1',
      webhookUrl: 'http://localhost:3000/api/v2/wallets/webhook',
      queueUrl: ''
    },
    charge: {
      url: 'https://api.fuse.io/api/v0/notifications/webhook/add-addresses'
    }
  },
  fuseswap: {
    api: {
      url: 'https://api.fuseswap.com/api/v1/'
    }
  },
  network: {
    misc: {
      pageSize: 1000,
      minGasLimit: 50000
    },
    home: {
      native: {
        address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        decimals: 18,
        name: 'Fuse',
        symbol: 'FUSE'
      },
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
      contracts: {
        fusd: {
          decimals: 18,
          deploymentBlock: 9394716
        }
      },
      sharedAddresses: {
        WalletFactory: '0x44EECa5BaA921b557cCd62718674D7b1eaF59469',
        WalletImplementation: '0x5c22F2fbC244af520DbF5c1B039f66bA897eAcA2',
        CommunityFactory: '0xcc004Ee01Da7D9207aBE384cE601623E9F223536',
        MultiSigWallet: '0x473a89758216A1983c04ba91A2a11B616fc93392',
        TokenFactory: '0x78Cb0FeEC1fA3b3469cA18e79823b6A87C8929a4',
        FuseDollar: '0x249BE57637D8B013Ad64785404b24aeBaE9B098B',
        WrappedFuse: '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629',
        walletModules: {
          GuardianManager: '0x8132d03887a08D75BaE1FF830A969b7DbE1Dadcf',
          LockManager: '0xf132640136FF929e5a1D067f21030ec079bfa239',
          RecoveryManager: '0xD201b3e96d6794fBB4Dc20A37e1a3757DEA971fD',
          ApprovedTransfer: '0x15eAEE837143D5509d4A3c1Bb1388225e689E830',
          TransferManager: '0x6D04DC125227fCDABcC18EFE3De89eAde15e4eE8',
          TokenExchanger: '0xB8c17dDA33b331CA94B82f63f03a60f736cF5Cd7',
          CommunityManager: '0xC85ee948605f3AF743D27D2A57bA0f0FB9805F0F',
          WalletOwnershipManager: '0xc81a757c05F42e299E5c66CA1e28b3c10b0594Bb'
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
      name: 'mainnet',
      bridgeType: 'foreign',
      native: {
        address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH'
      },
      contract: {
        options: {
          transactionConfirmationBlocks: 2
        }
      },
      provider: defer(function () {
        if (this.network.foreign.providers.default === 'infura') {
          return `https://${this.network.foreign.name}.infura.io/v3/${this.network.foreign.apiKey}`
        } else {
          return this.network.foreign.providers.alchemy.http
        }
      }),
      providers: {
        infura: {

        },
        alchemy: {
          http: ''
        },
        default: 'infura'
      },
      addressesMainnet: {
        TokenFactory: '0xB2100946628D3e45FF94971b35508AfCBBc87432',
        ForeignBridgeFactory: '0xaC116929b2baB59D05a1Da99303e7CAEd100ECC9',
        TotlePrimary: '0x74758acfce059f503a7e6b0fc2c8737600f9f2c4',
        MultiBridgeMediator: '0xf301d525da003e874DF574BCdd309a6BF0535bb6',
        USDCoin: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        DaiStablecoin: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        TetherUSD: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        FuseToken: '0x970b9bb2c0444f5e81e9d0efb84c8ccdcdcaf84d'
      },
      addressesRopsten: {
        TokenFactory: '0x6004EAdF0aD3aCd568F354CA7E2b410bA0080E98',
        ForeignBridgeFactory: '0xABBf5D8599B2Eb7b4e1D25a1Fd737FF1987655aD',
        TotlePrimary: '0x74758acfce059f503a7e6b0fc2c8737600f9f2c4',
        MultiBridgeMediator: '0x68b762A7a68F6D87Fcf2E2EaF7eF48D00cAa2419',
        USDCoin: '0xe50dc0fe33eb88fc0ce0f1f52cd30a7f46a6eae4',
        DaiStablecoin: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        TetherUSD: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        FuseToken: '0x970b9bb2c0444f5e81e9d0efb84c8ccdcdcaf84d'
      },
      addresses: defer(function () {
        if (this.network.foreign.name === 'mainnet') {
          return this.network.foreign.addressesMainnet
        } else {
          return this.network.foreign.addressesRopsten
        }
      }),
      gasStation: {
        url: 'https://ethgasstation.info/json/ethgasAPI.json',
        speed: 'average'
      }
    },
    bsc: {
      addresses: {
        BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'
      }
    }
  },
  mongo: {
    uri: 'mongodb://localhost/fuse-studio',
    debug: true,
    options: {
    }
  },
  mail: {
    sendgrid: {
      templates: {}
    },
    managers: ['example@example.com']
  },
  explorer: {
    fuse: {
      urlBase: 'https://explorer.fuse.io/api'
    }
  },
  agenda: {
    args: {
      defaultConcurrency: 5
    },
    startPeriodicTasks: true,
    tasks: {
      deploy: {
        concurrency: 5
      },
      transfer: {
        concurrency: 1
      },
      initiateActions: {
        concurrency: 1
      },
      createWallet: {
        concurrency: 4,
        priority: 'high'
      },
      createForeignWallet: {
        concurrency: 4
      },
      relay: {
        priority: 'high'
      }
    }
  },
  taskManager: {
    transport: 'sqs',
    lockedAccounts: {
      delayTimeout: 5
    }
  },
  funder: {
    urlBase: 'https://funder-qa.fuse.io/api/'
  },
  bonus: {
    launch: {
      fuse: 1
    },
    trade: {
      fuse: 0.01
    },
    eth: {
      ropsten: 0.05
    },
    topup: {
      percentage: 0.1,
      enabled: false
    },
    referral: {
      percentage: 0.1,
      enabled: true
    }
  },
  branch: {
    urlBase: 'https://api2.branch.io/v1/',
    keys: {
      fusecash: 'key_live_ei3pINZQchWGN7VDrB1njgcfzshiwvmX',
      fuseWallet: 'key_live_aaSvQXmuELUQfsYeG4UfWemnqEiq04hr'
    }
  },
  plugins: {
    fuseswap: {
      args: {
        widgetUrl: 'https://fuseswap.com/#/add/'
      }
    },
    moonpay: {
      currencies: {
        '0c9480ef-2fab-4d31-9037-da4b29ecc16f': '0x48B0C1D90C3058ab032C44ec52d98633587eE711'
      },
      args: {
      }
    },
    transak: {
      args: {
      },
      api: {
        urlBase: 'https://staging-api.transak.com/api/v2/'
      },
      tokensMapping: {
        'ETH': {
          tokenAddress: '0x0000000000000000000000000000000000000000',
          decimals: 18
        },
        'BUSD': {
          tokenAddress: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
          decimals: 18
        },
        'USDC': {
          tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          decimals: 6
        }
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
    rampInstant: {
      args: {
      },
      webhook: {
        pemFile: 'ramp-public.staging.pem',
        skipAuth: true
      },
      fuseDollarAccount: '0x'
    },
    fuseDollar: {
      verifyStableCoin: false,
      useOnly: true
    }
  },
  deposit: {
    supportedNetworks: ['ethereum', 'bsc', 'fuse'],
    availableTypes: ['mint', 'naive']
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
    },
    s3: {
      bucket: 'fuse-studio-qa'
    },
    sqs: {
      queueUrl: '',
      constructor: {
        region: 'eu-cental-1',
        apiVersion: '2012-11-05'
      },
      receive: {
        WaitTimeSeconds: 5
      }
    }
  },
  accounts: {
    wallet: {
      initialBalance: '0.1'
    },
    maxLockSeconds: 60
  },
  community: {
    initialBalance: '1',
    limitPerUser: 10
  },
  slack: {
    channel: 'monitor'
  },
  alerts: {
    lockedAccounts: {
      threshold: 10 // in minutes
    },
    lowBalanceAccounts: {
      options: [
        {
          role: 'wallet',
          bridgeType: 'home'
        },
        {
          role: 'fuse-funder',
          bridgeType: 'home'
        },
        {
          role: 'apy-funder',
          bridgeType: 'home'
        },
        {
          role: 'funder',
          bridgeType: 'home'
        },
        {
          role: 'deposits',
          bridgeType: 'home'
        }
      ],
      threshold: '0.25' // in ETH
    }
  },
  daipCommunityAddress: '0xc036118695Eff203b00B74B5a3ef8c3fA808E09B',
  segment: {
    ios: 'KzFIKc0VjOnnhoVclBFzyvoaeCpJOOiS',
    android: 'b4aJlPklY2YWc0Z6KhMFsR486E7k4p2r'
  },
  apy: {
    launch: {
      blockNumber: 12150000,
      timestamp: 1627188580
    },
    claim: {
      interval: 25200
    },
    sync: {
      interval: 600
    },
    account: {
      address: '0x8fC6e52f774e6154adf44E6d6dAa4C35a12A4D4A'
    },
    campaigns: [
      {
        rate: 0.05,
        since: {
          timestamp: 1625290115
        },
        until: {
          timestamp: 1634025600
        }
      },
      {
        since: {
          timestamp: 1634025600
        },
        rewardBrackets: [
          { limitAmount: 1000, rate: 0.5 },
          { limitAmount: 10000, rate: 0.05 }
        ]
      }
    ]
  },
  wallet: {
    version: '1.7.0',
    paddedVersion: '0001.0007.0000'
  },
  beacons: {
    proximityUUID: '46697306-6d16-4bce-a9d6-c79752370810'
  }
}
