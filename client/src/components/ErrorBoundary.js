import React, {Component} from 'react'
import Modal from 'components/Modal'

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
      return (<Modal onClose={this.props.hideModal}>
        <h4>{'Oops, something went wrong'}</h4>
          <p>Please open Metamask and switch to the <strong>Main Ethereum Network</strong> to view correct CLN and CC information</p>
        </Modal>)
    }
    return this.props.children
  }
}

export default ErrorBoundary
