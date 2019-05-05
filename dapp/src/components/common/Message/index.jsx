import React, { Fragment } from 'react'
import classNames from 'classnames'
import FuseLoader from 'images/loader-fuse.gif'

export default ({ message, clickHandler, isOpen, isDark = false, subTitle = 'Waiting for signing', radiusAll = false }) => {
  if (!isOpen) {
    return null
  }

  return (
    <div className={classNames('status', { 'status--dark': isDark }, { 'status--radius-all': radiusAll })}>
      {
        !isDark ? (
          <Fragment>
            <p className='status__title status__title--dark'>{message}</p>
            {
              subTitle && (
                <div className='status__sub-title status__sub-title--dark'>
                  {subTitle}
                </div>
              )
            }
            <div className='status__button'>
              <button onClick={clickHandler}>Got it</button>
            </div>
          </Fragment>
        ) : (
          <Fragment>
            <div className='status__title status__title--white'>
              {message}
              <p className='status__loader'>
                <span>.</span><span>.</span><span>.</span>
              </p>
            </div>
            {
              subTitle && (
                <div className='status__sub-title status__sub-title--white'>
                  {subTitle}
                </div>
              )
            }
            <div className='status__loader__img'>
              <img src={FuseLoader} alt='Fuse loader' />
            </div>
          </Fragment>
        )
      }
    </div>
  )
}
