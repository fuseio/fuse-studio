module.exports = [
  {
    'constant': true,
    'inputs': [],
    'name': 'owner',
    'outputs': [
      {
        'name': '',
        'type': 'address'
      }
    ],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  },
  {
    'constant': false,
    'inputs': [
      {
        'name': 'newOwner',
        'type': 'address'
      }
    ],
    'name': 'transferOwnership',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'anonymous': false,
    'inputs': [
      {
        'indexed': true,
        'name': 'foreignToken',
        'type': 'address'
      },
      {
        'indexed': false,
        'name': 'homeToken',
        'type': 'address'
      },
      {
        'indexed': false,
        'name': 'foreignBridge',
        'type': 'address'
      },
      {
        'indexed': false,
        'name': 'homeBridge',
        'type': 'address'
      },
      {
        'indexed': false,
        'name': 'foreignStartBlock',
        'type': 'uint256'
      },
      {
        'indexed': false,
        'name': 'homeStartBlock',
        'type': 'uint256'
      }
    ],
    'name': 'BridgeMappingAdded',
    'type': 'event'
  },
  {
    'anonymous': false,
    'inputs': [
      {
        'indexed': true,
        'name': 'foreignToken',
        'type': 'address'
      }
    ],
    'name': 'BridgeMappingRemoved',
    'type': 'event'
  },
  {
    'anonymous': false,
    'inputs': [
      {
        'indexed': false,
        'name': 'previousOwner',
        'type': 'address'
      },
      {
        'indexed': false,
        'name': 'newOwner',
        'type': 'address'
      }
    ],
    'name': 'OwnershipTransferred',
    'type': 'event'
  },
  {
    'constant': true,
    'inputs': [
      {
        'name': '_foreignToken',
        'type': 'address'
      }
    ],
    'name': 'homeBridgeByForeignToken',
    'outputs': [
      {
        'name': '',
        'type': 'address'
      }
    ],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [
      {
        'name': '_foreignToken',
        'type': 'address'
      }
    ],
    'name': 'foreignBridgeByForeignToken',
    'outputs': [
      {
        'name': '',
        'type': 'address'
      }
    ],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [
      {
        'name': '_foreignToken',
        'type': 'address'
      }
    ],
    'name': 'homeTokenByForeignToken',
    'outputs': [
      {
        'name': '',
        'type': 'address'
      }
    ],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [
      {
        'name': '_foreignToken',
        'type': 'address'
      }
    ],
    'name': 'homeStartBlockByForeignToken',
    'outputs': [
      {
        'name': '',
        'type': 'uint256'
      }
    ],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [
      {
        'name': '_foreignToken',
        'type': 'address'
      }
    ],
    'name': 'foreignStartBlockByForeignToken',
    'outputs': [
      {
        'name': '',
        'type': 'uint256'
      }
    ],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  },
  {
    'constant': false,
    'inputs': [
      {
        'name': '_foreignToken',
        'type': 'address'
      },
      {
        'name': '_homeToken',
        'type': 'address'
      },
      {
        'name': '_foreignBridge',
        'type': 'address'
      },
      {
        'name': '_homeBridge',
        'type': 'address'
      },
      {
        'name': '_foreignStartBlock',
        'type': 'uint256'
      },
      {
        'name': '_homeStartBlock',
        'type': 'uint256'
      }
    ],
    'name': 'addBridgeMapping',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'constant': false,
    'inputs': [
      {
        'name': '_foreignToken',
        'type': 'address'
      }
    ],
    'name': 'removeBridgeMapping',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [],
    'name': 'getBridgeMapperVersion',
    'outputs': [
      {
        'name': 'major',
        'type': 'uint64'
      },
      {
        'name': 'minor',
        'type': 'uint64'
      },
      {
        'name': 'patch',
        'type': 'uint64'
      }
    ],
    'payable': false,
    'stateMutability': 'pure',
    'type': 'function'
  },
  {
    'constant': false,
    'inputs': [
      {
        'name': '_owner',
        'type': 'address'
      }
    ],
    'name': 'initialize',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }
]
