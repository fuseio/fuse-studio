import React from 'react'
import FontAwesome from 'react-fontawesome'

const Entity = ({entity}) => (
  <div className='entity'>
    <div className='entity-logo'>
      <FontAwesome name='bullseye' />
    </div>
    <div className='entity-content'>
      <div className='entity-name'>{entity.name}</div>
      <div className='entity-subtitle'>{entity.address}</div>
    </div>
  </div>
)

export default Entity
