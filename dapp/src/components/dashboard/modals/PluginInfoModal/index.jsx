import React from 'react'
import Modal from 'components/common/Modal'
import RemoveIcon from 'images/remove.svg'
import classNames from 'classnames'
import FontAwesome from 'react-fontawesome'

const PluginInfoModal = ({
  hideModal,
  coverImage,
  title,
  hasPlugin,
  disabled,
  managePlugin
}) => {
  const handleClick = () => {
    managePlugin()
    hideModal()
  }

  return (
    <Modal whiteClose hasCloseBtn className='plugin-info' onClose={hideModal}>
      <div className='plugin-info__image'>
        <div className='plugin-info__image__container'>
          <img src={coverImage} />
        </div>
      </div>
      <div className='plugin-info__content'>
        <h2 className='plugin-info__title'>{title}</h2>
        <p className='plugin-info__text'>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Animi distinctio sed corporis? Quia laboriosam hic sequi ab omnis officiis harum, perspiciatis doloremque laborum aliquid enim error praesentium dolorem aut magnam?</p>
        <button
          disabled={disabled}
          className={classNames('plugin-info__btn', { 'plugin-card__btn--add': !hasPlugin }, { 'plugin-card__btn--remove': hasPlugin })}
          onClick={handleClick}
        >
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
    </Modal>
  )
}

export default PluginInfoModal
