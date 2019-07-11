import { Component } from 'react'
import { connect } from 'react-redux'
import { signIn, create3boxProfile } from 'actions/accounts'
import { withRouter } from 'react-router-dom'

class SignInLayout extends Component {
  componentDidMount () {
    const { createNew, accountAddress } = this.props

    if (createNew) {
      const { create3boxProfile, data } = this.props
      console.log('create3boxProfile')
      create3boxProfile(accountAddress, data)
    } else {
      const { signIn } = this.props
      console.log('signIn')
      signIn(accountAddress)
    }
  }

  componentDidUpdate (prepProps, prevState) {
    if (!prepProps.isBoxConnected && this.props.isBoxConnected) {
      console.log({ isBoxConnected: this.props.isBoxConnected })
      window.location.replace('http://communities-qa.cln.network')
    }
  }

  render = () => null
}

const mapStateToProps = (state) => ({
  accountAddress: state.network.accountAddress,
  isBoxConnected: state.network.isBoxConnected
})

const mapDispatchToProps = {
  signIn,
  create3boxProfile
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(SignInLayout))
