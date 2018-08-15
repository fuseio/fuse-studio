import React from 'react'
import PropTypes from 'prop-types'

const ModalBody = (props) => (
  <div className='modal-body-wrapper'>
    <h4>{props.title}</h4>
    <div className='modal-body'>
      {props.image
        ? props.image
        : <img className='modal-icon' src={props.imageSrc} />
      }
      {props.body
        ? props.body
        : <p>{props.text} </p>}
    </div>
  </div>
)

ModalBody.propTypes = {
  title: PropTypes.string.isRequired,
  imageSrc: PropTypes.string,
  image: PropTypes.object,
  body: PropTypes.object,
  text: PropTypes.string
}

export default ModalBody
