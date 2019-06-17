import { Component } from 'react'
import { connect } from 'react-redux'
// import Box from '3box'
import { signIn } from 'actions/accounts'

class SignInLayout extends Component {
  componentDidMount = () => {
    this.props.signIn(this.props.accountAddress)
  }

  render = () => null
}

// const mapStateToProps = (state) => ({
//   accountAddress: getAccountAddress(state)
// })

const mapDispatchToProps = {
  signIn
}

export default connect(
  undefined,
  mapDispatchToProps
)(SignInLayout)
