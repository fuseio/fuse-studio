import React from 'react'
import RemoveIcon from 'images/remove.svg'
import classNames from 'classnames'
import FontAwesome from 'react-fontawesome'

const Plugin = ({
  title,
  image,
  hasPlugin,
  disabled,
  showInfoModal,
  subTitle,
  managePlugin
}) => {
  return (
    <div className='plugin-card'>
      <div className='plugin-card__image'>
        <div className='plugin-card__image__container'>
          <img src={image} />
        </div>
      </div>
      <div className={classNames('plugin-card__content', { 'plugin-card__content--disabled': disabled })}>
        <h2 className='plugin-card__title'>{title} <span>{subTitle}</span></h2>
        <div className='plugin-card__actions'>
          <span className='plugin-card__learn' onClick={showInfoModal}>LEARN MORE</span>
          <button disabled={disabled} className={classNames('plugin-card__btn', { 'plugin-card__btn--add': !hasPlugin }, { 'plugin-card__btn--remove': hasPlugin })} onClick={managePlugin}>
            {!hasPlugin ? (
              <React.Fragment>
                <FontAwesome name='plus-circle' style={{ color: 'white', marginRight: '5px' }} />
                <span>ADD</span>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <img src={RemoveIcon} />
                <span>Remove</span>
              </React.Fragment>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Plugin
