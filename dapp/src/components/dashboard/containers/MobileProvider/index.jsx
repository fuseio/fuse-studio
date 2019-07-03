import React, { Component } from 'react'
import { connect } from 'react-redux'
import JoinCommunity from 'components/dashboard/components/JoinCommunity'
import Web3 from 'containers/Web3'
import SignIn from 'components/common/SignIn'

class MobileProvider extends Component {
  state = {
    user: {},
    pk: ''
  }

  componentDidMount () {
    const interval = setInterval(() => {
      if (window && window.user) {
        console.log({ user: window.user })
        this.setState({ user: { ...window.user } })
      }
      if (window && window.pk) {
        console.log({ pk: window.pk })
        this.setState({ pk: window.pk })
      }
      if (window && window.user) {
        clearInterval(interval)
      }
    }, 100)
  }

  render () {
    const { communityAddress } = this.props
    return (
      <div>
        {
          this.state.pk
            ? (
              <React.Fragment>
                <Web3 />
                <JoinCommunity data={this.state.user} communityAddress={communityAddress} />
              </React.Fragment>
            )
            : undefined
        }
        {
          this.props.accountAddress
            ? <SignIn accountAddress={this.props.accountAddress} />
            : undefined
        }
      </div>
    )
  }
}

const mapStateToProps = (state, { match }) => ({
  accountAddress: state.network.accountAddress,
  communityAddress: match.params.address
})

export default connect(mapStateToProps)(MobileProvider)
