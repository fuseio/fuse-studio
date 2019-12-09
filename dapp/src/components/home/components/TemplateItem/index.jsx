import React from 'react'
import { useDispatch } from 'react-redux'
import { TEMPLATE_MODAL } from 'constants/uiConstants'
import { loadModal } from 'actions/ui'

import TemplateArrow from 'images/template_arrow.svg'

const TemplateItem = ({ setPath, showIssuance, title, image, hasSet, modalProps }) => {
  const dispatch = useDispatch()

  const showInfoModal = () => {
    window.analytics.track(`TEMPLATE MODAL - User click on ${title}`)
    dispatch(loadModal(TEMPLATE_MODAL, { setPath, showIssuance, title, ...modalProps }))
  }

  return (
    <div onClick={showInfoModal} className='item cell medium-12 small-24'>
      <div className='item__image'>
        <div className='item__image__container'>
          {
            hasSet
              ? <img alt='cover photo' sizes='(max-width:800px) 30vw,  600px' srcSet={image} />
              : <img alt='cover photo' src={image} />
          }
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
