import React, { Component } from 'react'
import { withNetwork, withAccount, withBox } from 'containers/Web3'
import { connect } from 'react-redux'
// import SignIn from 'components/common/SignIn'
import { joinCommunity } from 'actions/communityEntities'

class JoinCommunity extends Component {
  componentDidMount () {
    const { joinCommunity, data, communityAddress } = this.props
    joinCommunity(communityAddress, { ...data, type: 'user' })
  }

  render () {
    // const { data: { account } } = this.props
    return (
      <div>
        JoinCommunity
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  accountAddress: state.network.accountAddress
})

const mapDispatchToProps = {
  joinCommunity
}

export default withNetwork(withAccount(withBox(connect(mapStateToProps, mapDispatchToProps)(JoinCommunity))))
