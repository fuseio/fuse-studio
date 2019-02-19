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
        'name': '_foreignBridge',
        'type': 'address'
      },
      {
        'indexed': true,
        'name': '_foreignValidators',
        'type': 'address'
      },
      {
        'indexed': false,
        'name': '_blockNumber',
        'type': 'uint256'
      }
    ],
    'name': 'ForeignBridgeDeployed',
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
    'inputs': [],
    'name': 'getBridgeFactoryVersion',
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
      },
      {
        'name': '_bridgeValidatorsImplementation',
        'type': 'address'
      },
      {
        'name': '_requiredSignatures',
        'type': 'uint256'
      },
      {
        'name': '_initialValidators',
        'type': 'address[]'
      },
      {
        'name': '_bridgeValidatorsOwner',
        'type': 'address'
      },
      {
        'name': '_foreignBridgeErcToErcImplementation',
        'type': 'address'
      },
      {
        'name': '_requiredBlockConfirmations',
        'type': 'uint256'
      },
      {
        'name': '_gasPrice',
        'type': 'uint256'
      },
      {
        'name': '_foreignMaxPerTx',
        'type': 'uint256'
      },
      {
        'name': '_homeDailyLimit',
        'type': 'uint256'
      },
      {
        'name': '_homeMaxPerTx',
        'type': 'uint256'
      },
      {
        'name': '_foreignBridgeOwner',
        'type': 'address'
      },
      {
        'name': '_foreignProxyOwner',
        'type': 'address'
      }
    ],
    'name': 'initialize',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'constant': false,
    'inputs': [
      {
        'name': '_erc20Token',
        'type': 'address'
      }
    ],
    'name': 'deployForeignBridge',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [],
    'name': 'bridgeValidatorsImplementation',
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
        'name': '_bridgeValidatorsImplementation',
        'type': 'address'
      }
    ],
    'name': 'setBridgeValidatorsImplementation',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [],
    'name': 'requiredSignatures',
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
        'name': '_requiredSignatures',
        'type': 'uint256'
      }
    ],
    'name': 'setRequiredSignatures',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [],
    'name': 'initialValidators',
    'outputs': [
      {
        'name': '',
        'type': 'address[]'
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
        'name': '_initialValidators',
        'type': 'address[]'
      }
    ],
    'name': 'setInitialValidators',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [],
    'name': 'bridgeValidatorsOwner',
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
        'name': '_bridgeValidatorsOwner',
        'type': 'address'
      }
    ],
    'name': 'setBridgeValidatorsOwner',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [],
    'name': 'bridgeValidatorsProxyOwner',
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
        'name': '_bridgeValidatorsProxyOwner',
        'type': 'address'
      }
    ],
    'name': 'setBridgeValidatorsProxyOwner',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [],
    'name': 'foreignBridgeErcToErcImplementation',
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
        'name': '_foreignBridgeErcToErcImplementation',
        'type': 'address'
      }
    ],
    'name': 'setForeignBridgeErcToErcImplementation',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [],
    'name': 'requiredBlockConfirmations',
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
        'name': '_requiredBlockConfirmations',
        'type': 'uint256'
      }
    ],
    'name': 'setRequiredBlockConfirmations',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [],
    'name': 'gasPrice',
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
        'name': '_gasPrice',
        'type': 'uint256'
      }
    ],
    'name': 'setGasPrice',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [],
    'name': 'foreignMaxPerTx',
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
        'name': '_foreignMaxPerTx',
        'type': 'uint256'
      }
    ],
    'name': 'setForeignMaxPerTx',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [],
    'name': 'homeDailyLimit',
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
        'name': '_homeDailyLimit',
        'type': 'uint256'
      }
    ],
    'name': 'setHomeDailyLimit',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [],
    'name': 'homeMaxPerTx',
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
        'name': '_homeMaxPerTx',
        'type': 'uint256'
      }
    ],
    'name': 'setHomeMaxPerTx',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [],
    'name': 'foreignBridgeOwner',
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
        'name': '_foreignBridgeOwner',
        'type': 'address'
      }
    ],
    'name': 'setForeignBridgeOwner',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [],
    'name': 'foreignBridgeProxyOwner',
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
        'name': '_foreignBridgeProxyOwner',
        'type': 'address'
      }
    ],
    'name': 'setForeignBridgeProxyOwner',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }
]
