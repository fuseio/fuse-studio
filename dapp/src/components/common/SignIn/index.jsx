import { Component } from 'react'
import { connect } from 'react-redux'
import { signIn } from 'actions/accounts'

class SignInLayout extends Component {
  componentDidMount = () => {
    this.props.signIn(this.props.accountAddress)
  }

  render = () => null
}

const mapDispatchToProps = {
  signIn
}

export default connect(
  undefined,
  mapDispatchToProps
)(SignInLayout)
