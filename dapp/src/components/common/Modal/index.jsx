import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import CloseButton from 'images/x.png'
import CloseButtonWhite from 'images/x_white.svg'

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
    const { children, hasCloseBtn, className, whiteClose, onClose } = this.props

    return (
      <div className='modal'>
        <div className='overlay' />
        <div className='modal__container' onClick={onClose}>
          <div className={classNames('modal__content', className)} onClick={this.onDialogClick}>
            {
              hasCloseBtn && (
                <div className='modal__content__close' onClick={onClose}>
                  <img src={whiteClose ? CloseButtonWhite : CloseButton} />
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
