import React, { Component } from 'react'
import CommunitiesList from 'components/oven/CommunitiesList'
import { connect } from 'react-redux'
import { fetchTokens, fetchTokensByOwner, fetchFuseToken, fetchFeaturedCommunities } from 'actions/token'
import { loadModal } from 'actions/ui'
import { getAccountAddress } from 'selectors/accounts'
import { getForeignNetwork } from 'selectors/network'
import isEmpty from 'lodash/isEmpty'
import { push } from 'connected-react-router'
import { withNetwork } from 'containers/Web3'
import withTracker from 'containers/withTracker'

class CommunitiesPage extends Component {
  constructor (props) {
    super(props)

    this.myRef = React.createRef()
  }

  componentDidMount () {
    const { featuredCommunities } = this.props
    if (isEmpty(featuredCommunities)) {
      const { fetchFeaturedCommunities } = this.props
      fetchFeaturedCommunities()
    }
    // if (this.props.networkType !== 'fuse') {
    //   this.props.fetchFuseToken()
    // }
    // if (this.props.account) {
    //   const { networkType } = this.props
    //   this.props.fetchTokensByOwner(networkType, this.props.account)
    // }
  }

  // componentDidUpdate (prevProps) {
  //   if (this.props.account && !prevProps.account) {
  //     const { networkType } = this.props
  //     this.props.fetchTokensByOwner(networkType, this.props.account)
  //   }

  //   if (!isEqual(this.props.account, prevProps.account)) {
  //     const { networkType } = this.props
  //     this.props.fetchTokensByOwner(networkType, this.props.account)
  //   }
  // }

  showDashboard = (communityAddress, name) => {
    if (window && window.analytics) {
      if (name) {
        window.analytics.track(`Clicked on featured community - ${name}`)
      }
    }
    this.props.push(`/view/community/${communityAddress}`)
  }

  getScrollParent = () => this.myRef.current

  render = () => (
    <div className='communities' ref={this.myRef}>
      <CommunitiesList getScrollParent={this.getScrollParent} {...this.props} showDashboard={this.showDashboard} />
    </div>
  )
}

const mapStateToProps = state => ({
  featuredCommunities: state.accounts.featuredCommunities,
  tokens: state.entities.tokens,
  communities: state.entities.communities,
  metadata: state.entities.metadata,
  account: getAccountAddress(state),
  foreignNetwork: getForeignNetwork(state),
  ...state.screens.oven
})

const mapDispatchToProps = {
  fetchTokens,
  fetchTokensByOwner,
  loadModal,
  fetchFuseToken,
  fetchFeaturedCommunities,
  push
}

export default withTracker(withNetwork(connect(
  mapStateToProps,
  mapDispatchToProps
)(CommunitiesPage)))
