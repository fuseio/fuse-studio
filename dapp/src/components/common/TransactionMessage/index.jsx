import React from 'react'
import classNames from 'classnames'
import FuseLoader from 'images/loader-fuse.gif'

export default ({ title, message = 'Pending', clickHandler, isOpen, isDark = true, subTitle = 'Waiting for signing', radiusAll = true }) => {
  if (!isOpen) {
    return null
  }

  return (
    <div className={classNames('status', { 'status--dark': isDark }, { 'status--radius-all-3': radiusAll })}>
      <div className='status__title status__title--white'>{title}</div>
      {
        message && (
          <div className='status__sub-title status__sub-title--white'>
            {message}
            <p className='status__loader'>
              <span>.</span><span>.</span><span>.</span>
            </p>
          </div>
        )
      }
      <div className='status__loader__img'>
        <img src={FuseLoader} alt='Fuse loader' />
      </div>
    </div>
  )
}
