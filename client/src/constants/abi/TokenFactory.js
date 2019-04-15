module.exports = [
  {
    'anonymous': false,
    'inputs': [
      {
        'indexed': true,
        'name': 'token',
        'type': 'address'
      },
      {
        'indexed': true,
        'name': 'issuer',
        'type': 'address'
      },
      {
        'indexed': false,
        'name': 'tokenType',
        'type': 'uint8'
      }
    ],
    'name': 'TokenCreated',
    'type': 'event',
    'signature': '0x49fab9e82f453b3b0e1b0e507a645552d8b351f9b3cb0c9a7b4df572780c6b2f'
  },
  {
    'constant': false,
    'inputs': [
      {
        'name': 'name',
        'type': 'string'
      },
      {
        'name': 'symbol',
        'type': 'string'
      },
      {
        'name': 'initialSupply',
        'type': 'uint256'
      },
      {
        'name': 'tokenURI',
        'type': 'string'
      }
    ],
    'name': 'createBasicToken',
    'outputs': [
      {
        'name': 'tokenAddress',
        'type': 'address'
      }
    ],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function',
    'signature': '0x77f53095'
  },
  {
    'constant': false,
    'inputs': [
      {
        'name': 'name',
        'type': 'string'
      },
      {
        'name': 'symbol',
        'type': 'string'
      },
      {
        'name': 'initialSupply',
        'type': 'uint256'
      },
      {
        'name': 'tokenURI',
        'type': 'string'
      }
    ],
    'name': 'createMintableBurnableToken',
    'outputs': [
      {
        'name': 'tokenAddress',
        'type': 'address'
      }
    ],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function',
    'signature': '0x5496b217'
  }
]
