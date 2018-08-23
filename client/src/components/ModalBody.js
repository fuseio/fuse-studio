import React from 'react'
import PropTypes from 'prop-types'

const ModalBody = (props) => (
  <div className='modal-body-wrapper'>
    <h4>{props.title}</h4>
    <div className='modal-body'>
      <img className='modal-icon' src={props.image} />
      <p>{props.text} </p>
    </div>
  </div>
)

ModalBody.propTypes = {
  title: PropTypes.string.isRequired,
  image: PropTypes.string,
  text: PropTypes.string
}

export default ModalBody
