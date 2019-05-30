const deployProgress = [
  {
    label: 'Issuing community currency',
    loaderText: 'Your asset is being deployed as an ERC-20 contract to Ethereum mainnet',
    key: 'tokenIssued'
  },
  {
    label: 'Deploy community contract',
    loaderText: 'The members list is deployed on the Fuse sidechain to allow adding users to the community',
    key: 'community'
  },
  {
    label: 'Deploying bridge contract',
    loaderText: 'A bridge contract is being deployed for the community currency on mainnet and the Fuse sidechain',
    key: 'bridge'
  },
  {
    label: 'Transfer ownership to the user',
    // loaderText: 'Transfer ownership to the user',
    key: 'transferOwnership'
  }
]

export default deployProgress
