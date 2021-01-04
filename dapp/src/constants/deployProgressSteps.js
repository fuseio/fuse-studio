import React from 'react'
import FontAwesome from 'react-fontawesome'
import { getBlockExplorerUrl } from 'utils/network'

const deployProgress = [
  {
    label: 'Issuing economy currency',
    loaderText: (networkType) => `Your asset is being deployed as an ERC-20 contract to Ethereum ${networkType}`,
    key: 'tokenIssued',
    RenderLink: ({ txHash }) => (
      <a target='_blank' rel='noopener noreferrer' style={{ marginLeft: '5px' }} href={`${getBlockExplorerUrl('fuse')}/tx/${txHash}`}>
        <FontAwesome style={{ fontSize: '14px' }} name='external-link-alt' />
      </a>
    )
  },
  {
    label: 'Deploy economy contract',
    loaderText: 'The members list is deployed on the Fuse sidechain to allow adding users to the economy',
    key: 'community'
  }
]

export default deployProgress
