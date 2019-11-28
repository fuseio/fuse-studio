import React from 'react'
import { push } from 'connected-react-router'
import { connect } from 'react-redux'
import Modal from 'components/common/Modal'
import BackgroundTemplate from 'images/background__template.png'

const TemplateModal = ({
  hideModal,
  logo,
  sideImage,
  title,
  templateId,
  showIssuance,
  attributes = [
    'Issue your own mintable burnable token',
    'Wallet',
    'Merchants and suppliers',
    'Join Bonus'
  ],
  attributesTitle = `The Community currency  consists of the following modules on Fuse:`,
  text
}) => {
  const useTemplate = () => {
    hideModal()
    showIssuance(`/view/issuance/${templateId}`)
  }

  return (
    <Modal whiteClose hasCloseBtn className='template_modal' onClose={hideModal}>
      <div className='template_modal__banner__image'>
        <div className='template_modal__banner__image__container'>
          <img src={BackgroundTemplate} />
        </div>
        <div className='template_modal__banner__logo'>
          <img className='template_modal__logo' src={logo} />
          <div className='template_modal__title'>{title}</div>
        </div>
      </div>
      <div className='content__wrapper grid-y'>
        <div className='content'>
          <div className='text'>{text}</div>
          <div className='title'>{attributesTitle}</div>
          <ul className='attributes'>
            {attributes.map((attribute, index) => <li key={index} className='item'>{attribute}</li>)}
          </ul>
          <div className='content__button'>
            <button onClick={useTemplate}>Use this template</button>
          </div>
        </div>
      </div>
      <div className='side_image' style={{ backgroundImage: `url(${sideImage})` }} />>
    </Modal>
  )
}

const mapDispatchToProps = {
  push
}

export default connect(null, mapDispatchToProps)(TemplateModal)
