import { Component } from 'react'
import { connect } from 'react-redux'
import { signIn, create3boxProfile } from 'actions/accounts'

class SignInLayout extends Component {
  componentDidMount = () => {
    const { signIn, create3boxProfile, createNew, accountAddress, data } = this.props

    if (createNew) {
      create3boxProfile(accountAddress, data)
    } else {
      signIn(accountAddress)
    }
  }

  render = () => null
}

const mapDispatchToProps = {
  signIn,
  create3boxProfile
}

export default connect(
  undefined,
  mapDispatchToProps
)(SignInLayout)
