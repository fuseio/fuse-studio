module.exports = [
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
    'constant': true,
    'inputs': [],
    'name': 'validatorContract',
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
    'anonymous': false,
    'inputs': [
      {
        'indexed': false,
        'name': 'recipient',
        'type': 'address'
      },
      {
        'indexed': false,
        'name': 'value',
        'type': 'uint256'
      }
    ],
    'name': 'UserRequestForSignature',
    'type': 'event'
  },
  {
    'anonymous': false,
    'inputs': [
      {
        'indexed': false,
        'name': 'recipient',
        'type': 'address'
      },
      {
        'indexed': false,
        'name': 'value',
        'type': 'uint256'
      },
      {
        'indexed': false,
        'name': 'transactionHash',
        'type': 'bytes32'
      }
    ],
    'name': 'AffirmationCompleted',
    'type': 'event'
  },
  {
    'anonymous': false,
    'inputs': [
      {
        'indexed': true,
        'name': 'signer',
        'type': 'address'
      },
      {
        'indexed': false,
        'name': 'messageHash',
        'type': 'bytes32'
      }
    ],
    'name': 'SignedForUserRequest',
    'type': 'event'
  },
  {
    'anonymous': false,
    'inputs': [
      {
        'indexed': true,
        'name': 'signer',
        'type': 'address'
      },
      {
        'indexed': false,
        'name': 'transactionHash',
        'type': 'bytes32'
      }
    ],
    'name': 'SignedForAffirmation',
    'type': 'event'
  },
  {
    'anonymous': false,
    'inputs': [
      {
        'indexed': false,
        'name': 'authorityResponsibleForRelay',
        'type': 'address'
      },
      {
        'indexed': false,
        'name': 'messageHash',
        'type': 'bytes32'
      },
      {
        'indexed': false,
        'name': 'NumberOfCollectedSignatures',
        'type': 'uint256'
      }
    ],
    'name': 'CollectedSignatures',
    'type': 'event'
  },
  {
    'constant': false,
    'inputs': [
      {
        'name': 'recipient',
        'type': 'address'
      },
      {
        'name': 'value',
        'type': 'uint256'
      },
      {
        'name': 'transactionHash',
        'type': 'bytes32'
      }
    ],
    'name': 'executeAffirmation',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'constant': false,
    'inputs': [
      {
        'name': 'signature',
        'type': 'bytes'
      },
      {
        'name': 'message',
        'type': 'bytes'
      }
    ],
    'name': 'submitSignature',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [
      {
        'name': '_withdrawal',
        'type': 'bytes32'
      }
    ],
    'name': 'numAffirmationsSigned',
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
        'name': '_withdrawal',
        'type': 'bytes32'
      }
    ],
    'name': 'affirmationsSigned',
    'outputs': [
      {
        'name': '',
        'type': 'bool'
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
        'name': '_hash',
        'type': 'bytes32'
      },
      {
        'name': '_index',
        'type': 'uint256'
      }
    ],
    'name': 'signature',
    'outputs': [
      {
        'name': '',
        'type': 'bytes'
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
        'name': '_message',
        'type': 'bytes32'
      }
    ],
    'name': 'messagesSigned',
    'outputs': [
      {
        'name': '',
        'type': 'bool'
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
        'name': '_hash',
        'type': 'bytes32'
      }
    ],
    'name': 'message',
    'outputs': [
      {
        'name': '',
        'type': 'bytes'
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
        'name': '_number',
        'type': 'uint256'
      }
    ],
    'name': 'isAlreadyProcessed',
    'outputs': [
      {
        'name': '',
        'type': 'bool'
      }
    ],
    'payable': false,
    'stateMutability': 'pure',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [
      {
        'name': '_message',
        'type': 'bytes32'
      }
    ],
    'name': 'numMessagesSigned',
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
    'inputs': [],
    'name': 'requiredMessageLength',
    'outputs': [
      {
        'name': '',
        'type': 'uint256'
      }
    ],
    'payable': false,
    'stateMutability': 'pure',
    'type': 'function'
  }
]
