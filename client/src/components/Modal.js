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

  onDialogClick (event) {
    event.stopPropagation()
  }

  render () {
    return (
      <div>
        <div className={'modal-overlay-div'} />
        <div className={classNames('modal-content-div', this.props.className)} onClick={this.props.onClose}>
          <div className={classNames('modal-dialog-div', this.props.className)} style={{ width: this.props.width || '432px' }} onClick={this.onDialogClick}>
            <div className='sidebar-close' onClick={this.props.onClose}>
              <img src={CloseButton} />
            </div>
            {this.props.children}
          </div>
        </div>
      </div>
    )
  }
}

Modal.propTypes = {
  onClose: PropTypes.func.isRequired
}
