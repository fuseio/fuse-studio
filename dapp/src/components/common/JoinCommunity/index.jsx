import React, { Component } from 'react'
import { withNetwork, withAccount, withBox } from 'containers/Web3'
import { connect } from 'react-redux'
import { joinCommunity } from 'actions/communityEntities'
import { withRouter } from 'react-router-dom'

class JoinCommunity extends Component {
  componentDidMount () {
    const { joinCommunity, data, communityAddress } = this.props
    joinCommunity(communityAddress, { ...data, type: 'user' })
  }

  render () {
    return (
      <div>
        Join Community Page
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  accountAddress: state.network.accountAddress,
  isBoxConnected: state.network.isBoxConnected
})

const mapDispatchToProps = {
  joinCommunity
}

export default withRouter(withNetwork(withAccount(withBox(connect(mapStateToProps, mapDispatchToProps)(JoinCommunity)))))
