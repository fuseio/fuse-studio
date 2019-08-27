import React from 'react'
import Modal from 'components/common/Modal'
import AddIcon from 'images/add-selected.png'

const PluginInfoModal = ({
  hideModal,
  coverImage,
  title,
  text,
  ...props
}) => {
  return (
    <Modal hasCloseBtn className='plugin-info' onClose={hideModal}>
      <div className='plugin-info__image'>
        <div className='plugin-info__image__container'>
          <img src={coverImage} />
        </div>
      </div>
      <div className='plugin-info__content'>
        <h2 className='plugin-info__title'>{title}</h2>
        <p className='plugin-info__text'>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Animi distinctio sed corporis? Quia laboriosam hic sequi ab omnis officiis harum, perspiciatis doloremque laborum aliquid enim error praesentium dolorem aut magnam?</p>
        <button className='plugin-info__btn'><img src={AddIcon} /> ADD</button>
      </div>
    </Modal>
  )
}

export default PluginInfoModal
