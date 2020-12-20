import React from 'react'
import RemoveIcon from 'images/remove.svg'
import classNames from 'classnames'
import FontAwesome from 'react-fontawesome'
import { observer } from 'mobx-react'
import { useStore } from 'mobxStore'

const Plugin = ({
  title,
  image,
  disabled,
  showInfoModal,
  subTitle,
  managePlugin,
  modifier,
  text,
  pluginKey
}) => {
  const { dashboard } = useStore()
  const hasPlugin = !dashboard?.plugins[pluginKey]?.isRemoved
  return (
    <div className='plugin-card cell small-24 medium-8'>
      <div className={classNames('plugin-card__image', { 'plugin-card__image--fiat': modifier })}>
        <div className='plugin-card__image__container'>
          <img src={image} />
        </div>
      </div>
      <div className={classNames('plugin-card__content grid-y align-justify', { 'plugin-card__content--fiat': modifier, 'plugin-card__content--disabled': disabled })}>
        <h2 className='plugin-card__title cell small-24'>{title} <span>{subTitle}</span></h2>
        {text && <p className='plugin-card__text cell small-24'>{text}</p>}
        <div className='plugin-card__actions cell small-24'>
          <button disabled={disabled} className='plugin-card__learn' onClick={showInfoModal}>LEARN MORE</button>
          <button disabled={disabled} className={classNames('plugin-card__btn', { 'plugin-card__btn--add': !hasPlugin }, { 'plugin-card__btn--remove': hasPlugin })} onClick={managePlugin}>
            {!hasPlugin
              ? (
                <>
                  <FontAwesome name='plus-circle' style={{ color: 'white', marginRight: '5px' }} />
                  <span>ADD</span>
                </>
                )
              : (
                <>
                  <img src={RemoveIcon} />
                  <span>Remove</span>
                </>
                )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default observer(Plugin)
