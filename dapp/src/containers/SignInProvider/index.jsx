import React, { Component } from 'react'
import { connect } from 'react-redux'
import SignIn from 'components/common/SignIn'

class SignInProvider extends Component {
  state = {
    user: {}
  }

  componentDidMount () {
    const interval = setInterval(() => {
      if (window && window.user) {
        this.setState({ user: { ...window.user } })
        clearInterval(interval)
      }
    }, 100)
  }

  render () {
    const { user } = this.state
    const { accountAddress } = this.props
    return (
      accountAddress && <SignIn createNew data={user} accountAddress={accountAddress} />
    )
  }
}

const mapStateToProps = (state) => ({
  accountAddress: state.network.accountAddress
})

export default connect(mapStateToProps, null)(SignInProvider)
