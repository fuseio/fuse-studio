import React from 'react'
import { useDispatch } from 'react-redux'
import { TEMPLATE_MODAL } from 'constants/uiConstants'
import { loadModal } from 'actions/ui'

import TemplateArrow from 'images/template_arrow.svg'

const TemplateItem = ({ showIssuance, title, Image, modalProps }) => {
  const dispatch = useDispatch()

  const showInfoModal = () => {
    window.analytics.track(`TEMPLATE MODAL - User click on ${title}`)
    dispatch(loadModal(TEMPLATE_MODAL, { showIssuance, title, ...modalProps }))
  }

  return (
    <div onClick={showInfoModal} className='item cell medium-12 small-24'>
      <div className='item__image'>
        <div className='item__image__container'>
          <Image />
        </div>
      </div>
      <div className='item__content'>
        <h6 className='item__name'>{title}</h6>
        <button className='item__button' onClick={showInfoModal}>View details <img style={{ marginLeft: '4px' }} src={TemplateArrow} /></button>
      </div>
    </div>
  )
}

export default TemplateItem
