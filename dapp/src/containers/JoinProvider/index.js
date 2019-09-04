import React, { Component } from 'react'
import { connect } from 'react-redux'
import JoinCommunity from 'components/common/JoinCommunity'
import SignIn from 'components/common/SignIn'
import isEmpty from 'lodash/isEmpty'

class JoinProvider extends Component {
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
    const { communityAddress } = this.props
    return (
      <div>
        {
          !isEmpty(this.state.user)
            ? <JoinCommunity data={this.state.user} communityAddress={communityAddress} />
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

export default connect(mapStateToProps)(JoinProvider)
