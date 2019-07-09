import React, { Component } from 'react'
// import { connect } from 'react-redux'
import Web3, { withNetwork } from 'containers/Web3'
import SignIn from 'components/common/SignIn'

class SignInProvider extends Component {
  state = {
    user: {},
    pk: ''
  }

  componentDidMount () {
    const interval = setInterval(() => {
      if (window && window.user) {
        this.setState({ user: { ...window.user } })
      }
      if (window && window.pk) {
        this.setState({ pk: window.pk })
      }
      if (window && window.user && window.pk) {
        clearInterval(interval)
      }
    }, 100)
  }

  render () {
    const { pk, user } = this.state
    const { accountAddress } = this.props
    return (
      <React.Fragment>
        { pk && <Web3 /> }
        { accountAddress && <SignIn createNew data={user} accountAddress={accountAddress} /> }
      </React.Fragment>
    )
  }
}

// const mapStateToProps = (state) => ({
//   accountAddress: state.network.accountAddress
// })

export default withNetwork(SignInProvider)
