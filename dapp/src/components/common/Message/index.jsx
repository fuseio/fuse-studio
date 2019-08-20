import React, { Fragment } from 'react'
import classNames from 'classnames'
import FuseLoader from 'images/loader-fuse.gif'
import FontAwesome from 'react-fontawesome'
import ErrorIssuance from 'images/error_issuance.svg'

export default ({ message, clickHandler, isOpen, isDark = false, subTitle = 'Waiting for signing', radiusAll = false, issue = false }) => {
  if (!isOpen) {
    return null
  }

  let body
  if (issue) {
    body = (
      <div className={classNames('status status__issue', { 'status--dark': isDark }, { 'status--radius-all': radiusAll })}>
        {
          !isDark ? (
            <Fragment>
              <img className='error_image' src={ErrorIssuance} alt='error' />
              <p className='status__title status__title--dark'>{message}</p>
              {
                subTitle && (
                  <div className='status__sub-title status__sub-title--dark'>
                    {subTitle}
                  </div>
                )
              }
              <button style={{ margin: '40px 0 0px' }} className='button button--normal' onClick={clickHandler}>Ok</button>
            </Fragment>
          ) : (
            <Fragment>
              <p style={{ maxWidth: '280px' }} className='status__title status__title--white'>Your community is about to be born!</p>
              {
                subTitle && (
                  <div className='status__sub-title status__sub-title--white'>
                    <div className='status__title status__title--white'>
                      {message}
                      <p className='status__loader'>
                        <span>.</span><span>.</span><span>.</span>
                      </p>
                    </div>
                    {subTitle}
                    <div className='status__loader__img'>
                      <img src={FuseLoader} alt='Fuse loader' />
                    </div>
                  </div>
                )
              }
            </Fragment>
          )
        }
      </div>
    )
  } else {
    body = (
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

  return body
}
