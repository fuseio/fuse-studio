import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import CloseButton from 'images/x.png'

export default class Modal extends Component {
  listenKeyboard (event) {
    if (event.key === 'Escape' || event.keyCode === 27) {
      this.props.onClose()
    }
  }

  componentDidMount () {
    if (this.props.onClose) {
      window.addEventListener('keydown', this.listenKeyboard.bind(this), true)
    }
  }

  componentWillUnmount () {
    if (this.props.onClose) {
      window.removeEventListener('keydown', this.listenKeyboard.bind(this), true)
    }
  }

  onDialogClick = (event) => event.stopPropagation()

  render () {
    const { children, hasCloseBtn } = this.props
    return (
      <div className='modal'>
        <div className='overlay' />
        <div className='modal__container' onClick={this.props.onClose}>
          <div className='modal__content' onClick={this.onDialogClick}>
            {
              hasCloseBtn && (
                <div className='modal__content__close' onClick={this.props.onClose}>
                  <img src={CloseButton} />
                </div>
              )
            }
            {children}
          </div>
        </div>
      </div>
    )
  }
}

Modal.propTypes = {
  onClose: PropTypes.func.isRequired
}
