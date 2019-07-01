import React, { Component } from 'react'
import { withNetwork } from 'containers/Web3'
import { connect } from 'react-redux'
import SignIn from 'components/common/SignIn'

class JoinCommunity extends Component {
  componentDidMount () {
    const { joinCommunity, data, communityAddress = '0x9704a91CA5650EB5BD0313D65bC11214E730Ef22' } = this.props

    joinCommunity(communityAddress, { ...data, type: 'user' })
  }
  render () {
    const { data: { account } } = this.props
    return (
      <div>
        JoinCommunity
        {account ? <SignIn accountAddress={account} /> : undefined}
      </div>
    )
  }
}

export default connect()(withNetwork(JoinCommunity))
