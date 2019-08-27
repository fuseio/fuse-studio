import React from 'react'
import AddIcon from 'images/add-selected.png'
import classNames from 'classnames'

const Plugin = ({
  title,
  image,
  status,
  disabled,
  showInfoModal,
  subTitle
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
          <button className='plugin-card__btn'><img src={AddIcon} /> ADD</button>
        </div>
      </div>
    </div>
  )
}

export default Plugin
