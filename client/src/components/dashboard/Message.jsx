import React from 'react'
import FontAwesome from 'react-fontawesome'

export default ({ message, onTimeout, isOpen, timeout }) => {
  if (!isOpen) {
    return null
  }

  setTimeout(onTimeout, timeout)

  return (
    <div className='status'>
      <p className='status__message'>{message}</p>
      { message && !message.includes('Oops') && <FontAwesome className='status__icon' name='check' /> }
      { message && message.includes('Oops') && <FontAwesome className='status__icon' name='close' /> }
    </div>
  )
}
