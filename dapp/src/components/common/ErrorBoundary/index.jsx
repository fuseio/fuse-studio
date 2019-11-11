import React, { Component } from 'react'
import * as Sentry from '@sentry/browser'
import Modal from 'components/common/Modal'
import ModalBody from 'components/common/ModalBody'
import CloseButton from 'images/x.png'

class ErrorBoundary extends Component {
  state = {
    hasError: false,
    error: null
  }

  componentDidCatch (error, info) {
    Sentry.withScope((scope) => {
      scope.setExtras(info)
      const eventId = Sentry.captureException(error)
      this.setState({ eventId })
    })
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
