import React from 'react'
import PropTypes from 'prop-types'

const ModalBody = (props) => (
  <div className='modal-body'>
    <h4 className='modal-body__title'>{props.title}</h4>
    <div className='modal-body__content'>
      <img className='modal-body__content__icon' src={props.image} />
      <p className='modal-body__content__text'>{props.text} </p>
    </div>
  </div>
)

ModalBody.propTypes = {
  title: PropTypes.string.isRequired,
  image: PropTypes.string,
  text: PropTypes.string
}

export default ModalBody
