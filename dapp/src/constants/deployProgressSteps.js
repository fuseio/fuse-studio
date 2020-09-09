import React from 'react'
import FontAwesome from 'react-fontawesome'

const deployProgress = [
  {
    label: 'Issuing economy currency',
    loaderText: (networkType) => `Your asset is being deployed as an ERC-20 contract to Ethereum ${networkType}`,
    key: 'tokenIssued',
    RenderLink: ({ txHash }) => (
      <a target='_blank' rel='noopener noreferrer' style={{ marginLeft: '5px' }} href={`https://ropsten.etherscan.io/tx/${txHash}`}>
        <FontAwesome style={{ fontSize: '14px' }} name='external-link-alt' />
      </a>
    )
  },
  {
    label: 'Deploy economy contract',
    loaderText: 'The members list is deployed on the Fuse sidechain to allow adding users to the economy',
    key: 'community'
  },
  {
    label: 'Deploying bridge contract',
    loaderText: (networkType) => `A bridge contract is being deployed for the economy currency on mainnet and the Fuse sidechain ${networkType}`,
    key: 'bridge'
  },
  {
    label: 'Transfer ownership to the user',
    key: 'transferOwnership'
  }
]

export default deployProgress
