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
  managePlugin,
  modifier,
  text
}) => {
  return (
    <div className='plugin-card cell small-24 medium-8'>
      <div className={classNames('plugin-card__image', { 'plugin-card__image--fiat': modifier })}>
        <div className='plugin-card__image__container'>
          <img src={image} />
        </div>
      </div>
      <div className={classNames('plugin-card__content grid-y align-justify', { 'plugin-card__content--fiat': modifier, 'plugin-card__content--disabled': disabled })}>
        <h2 className={classNames('plugin-card__title cell small-24', { 'plugin-card__title--fiat': modifier })}>{title} <span>{subTitle}</span></h2>
        {text && <p className='plugin-card__text cell small-24'>{text}</p>}
        <div className='plugin-card__actions cell small-24'>
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
