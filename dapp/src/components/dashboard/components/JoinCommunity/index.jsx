import React, { Component } from 'react'
import { withNetwork, withBox } from 'containers/Web3'
import { connect } from 'react-redux'
// import SignIn from 'components/common/SignIn'
import { joinCommunity } from 'actions/communityEntities'

class JoinCommunity extends Component {
  componentDidMount () {
    const { joinCommunity, data, communityAddress = '0x9704a91CA5650EB5BD0313D65bC11214E730Ef22' } = this.props
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

export default withNetwork(withBox(connect(mapStateToProps, mapDispatchToProps)(JoinCommunity)))
