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
      }
    ],
    'name': 'TokenCreated',
    'type': 'event',
    'signature': '0xd5f9bdf12adf29dab0248c349842c3822d53ae2bb4f36352f301630d018c8139'
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
    'name': 'createToken',
    'outputs': [
      {
        'name': 'basicTokenAddress',
        'type': 'address'
      }
    ],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function',
    'signature': '0x322caed1'
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
    'name': 'createToken2',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function',
    'signature': '0x0c3f780b'
  }
]
