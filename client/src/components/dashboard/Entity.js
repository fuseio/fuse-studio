import React from 'react'
import FontAwesome from 'react-fontawesome'
import CopyToClipboard from 'components/common/CopyToClipboard'
import {getBlockExplorerUrl} from 'utils/network'

const Entity = ({entity, address, showProfile}) =>
  <div className='entity'>
    <div className='entity-logo' onClick={() => showProfile()}>
      <FontAwesome name='bullseye' />
    </div>
    <div className='entity-content'>
      <div className='entity-name' onClick={() => showProfile()}>{entity.name}</div>
      {entity.businessType && <div className='entity-type'>{entity.businessType}</div>}
      <div className='entity-subtitle'>
        <span className='text-asset'>Account ID</span> <a href={`${getBlockExplorerUrl('fuse')}/address/${address}`} target='_blank'><span className='id'>{address}</span></a>
        <CopyToClipboard text={address}>
          <FontAwesome name='clone' />
        </CopyToClipboard>
      </div>
    </div>
  </div>

export default Entity
