import React from 'react'
import FontAwesome from 'react-fontawesome'

const Entity = ({entity, address, copyToClipboard, showProfile}) =>
  <div className='entity'>
    <div className='entity-logo' onClick={() => showProfile()}>
      <FontAwesome name='bullseye' />
    </div>
    <div className='entity-content'>
      <div className='entity-name' onClick={() => showProfile()}>{entity.name}</div>
      <div className='entity-type'>{entity.businessType}</div>
      <div className='entity-subtitle'>
        Asset Id <span>{address}</span>
        {document.queryCommandSupported('copy') &&
          <span className='dashboard-information-period' onClick={(e) => copyToClipboard(e)}>
            <FontAwesome name='clone' />
          </span>
        }
      </div>
    </div>
  </div>

export default Entity
