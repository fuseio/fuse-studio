import React from 'react'
import FontAwesome from 'react-fontawesome'
import CopyToClipboard from 'components/common/CopyToClipboard'

const Entity = ({entity, address, showProfile}) =>
  <div className='entity'>
    <div className='entity-logo' onClick={() => showProfile()}>
      <FontAwesome name='bullseye' />
    </div>
    <div className='entity-content'>
      <div className='entity-name' onClick={() => showProfile()}>{entity.name}</div>
      <div className='entity-type'>{entity.businessType}</div>
      <div className='entity-subtitle'>
        Asset Id <span>{address}</span>
        <CopyToClipboard text={address}>
          <p className='dashboard-information-period'>
            <FontAwesome name='clone' />
          </p>
        </CopyToClipboard>
      </div>
    </div>
  </div>

export default Entity
