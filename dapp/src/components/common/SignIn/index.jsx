import { Component } from 'react'
import { connect } from 'react-redux'
import { signIn, create3boxProfile } from 'actions/accounts'
import { withRouter } from 'react-router'

class SignInLayout extends Component {
  componentDidMount () {
    const { createNew, accountAddress } = this.props

    if (createNew) {
      const { create3boxProfile, data } = this.props
      create3boxProfile(accountAddress, data)
    } else {
      const { signIn } = this.props
      signIn(accountAddress)
    }
  }

  componentDidUpdate (prevProps) {
    if (!prevProps.isBoxConnected && this.props.isBoxConnected && this.props.isMobileApp) {
      window.location.replace(window.location.origin)
    }
  }

  render = () => null
}

const mapStateToProps = (state, { match }) => ({
  accountAddress: state.network.accountAddress,
  isBoxConnected: state.network.isBoxConnected,
  isMobileApp: match.params.isMobileApp
})

const mapDispatchToProps = {
  signIn,
  create3boxProfile
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(SignInLayout))
