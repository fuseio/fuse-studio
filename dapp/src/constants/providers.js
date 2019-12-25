const providers = [
  {
    name: 'Web3',
    type: 'injected',
    check: 'isWeb3',
    styled: {
      noShadow: false
    }
  },
  {
    name: 'WalletConnect',
    type: 'qrcode',
    check: 'isWalletConnect',
    styled: {
      noShadow: false
    }
  },
  {
    name: 'MetaMask',
    type: 'injected',
    check: 'isMetaMask',
    styled: {
      noShadow: true
    }
  },
  {
    name: 'Safe',
    type: 'injected',
    check: 'isSafe',
    styled: {
      noShadow: true
    }
  },
  {
    name: 'Nifty',
    type: 'injected',
    check: 'isNiftyWallet',
    styled: {
      noShadow: true
    }
  },
  {
    name: 'Squarelink',
    type: 'web',
    check: 'isSquarelink',
    styled: {
      noShadow: true
    }
  },
  {
    name: 'Portis',
    type: 'web',
    check: 'isPortis',
    styled: {
      noShadow: true
    }
  },
  {
    name: 'Fortmatic',
    type: 'web',
    check: 'isFortmatic',
    styled: {
      noShadow: true
    }
  },
  {
    name: 'Arkane',
    type: 'web',
    check: 'isArkane',
    styled: {
      noShadow: true
    }
  },
  {
    name: 'Dapper',
    type: 'injected',
    check: 'isDapper',
    styled: {
      noShadow: true
    }
  },
  {
    name: 'Opera',
    type: 'injected',
    check: 'isOpera',
    styled: {
      noShadow: false
    }
  },
  {
    name: 'Trust',
    type: 'injected',
    check: 'isTrust',
    styled: {
      noShadow: false
    }
  },
  {
    name: 'Coinbase',
    type: 'injected',
    check: 'isToshi',
    styled: {
      noShadow: false
    }
  },
  {
    name: 'Cipher',
    type: 'injected',
    check: 'isCipher',
    styled: {
      noShadow: false
    }
  },
  {
    name: 'imToken',
    type: 'injected',
    check: 'isImToken',
    styled: {
      noShadow: false
    }
  },
  {
    name: 'Status',
    type: 'injected',
    check: 'isStatus',
    styled: {
      noShadow: false
    }
  },
  {
    name: 'Tokenary',
    type: 'injected',
    check: 'isTokenary',
    styled: {
      noShadow: false
    }
  },
  {
    name: 'Google',
    type: 'web',
    check: 'isTorus',
    styled: {
      noShadow: false
    }
  },
  {
    name: 'Authereum',
    type: 'web',
    check: 'isAuthereum',
    styled: {
      noShadow: true
    }
  }
]

export default providers
