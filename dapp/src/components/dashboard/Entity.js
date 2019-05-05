import React from 'react'
import FontAwesome from 'react-fontawesome'
import CopyToClipboard from 'components/common/CopyToClipboard'
import { getBlockExplorerUrl } from 'utils/network'

const Entity = ({ entity, address, showProfile }) =>
  <div className='entity' onClick={() => showProfile()}>
    <div className='entity-logo'>
      <FontAwesome name='bullseye' />
    </div>
    <div className='entity-content'>
      <span className='entity-name'>{entity.name}</span>
      {entity.businessType && <div className='entity-type'>{entity.businessType}</div>}
      <div className='entity-subtitle'>
        <span className='text-asset'>Account ID</span>
        <a onClick={e => e.stopPropagation()} href={`${getBlockExplorerUrl('fuse')}/address/${address}`} target='_blank'>
          <span className='id'>{address}</span>
        </a>
        <CopyToClipboard text={address}>
          <FontAwesome name='clone' />
        </CopyToClipboard>
      </div>
    </div>
  </div>

export default Entity
