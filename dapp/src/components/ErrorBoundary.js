import React, { Component } from 'react'
import Modal from 'components/Modal'
import ModalBody from 'components/ModalBody'
import CloseButton from 'images/x.png'

class ErrorBoundary extends Component {
  state = {
    hasError: false,
    error: null
  }

  componentDidCatch (error, info) {
    this.setState({ hasError: true, error })
  }

  render () {
    if (this.state.hasError) {
      return (
        <Modal onClose={this.props.hideModal}>
          <ModalBody
            title={'Oops, something went wrong'}
            text={'Don\'t worry, please try again or contact the support'}
            image={CloseButton} />
        </Modal>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
