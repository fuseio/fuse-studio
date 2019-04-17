import React from 'react'

export default ({ message, clickHandler, isOpen, timeout }) => {
  if (!isOpen) {
    return null
  }

  return (
    <div className='status'>
      <p className='status__message'>{message}</p>
      <div className='transfer-tab__content__button' style={{ alignSelf: 'center' }}>
        <button onClick={clickHandler}>Got it</button>
      </div>
    </div>
  )
}
