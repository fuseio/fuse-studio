import React, { Component } from 'react'
import { connect } from 'react-redux'
import { fetchTokens, fetchTokensByOwner, fetchFuseToken } from 'actions/token'
import { loadModal } from 'actions/ui'
import { getAccountAddress } from 'selectors/accounts'
import { getForeignNetwork } from 'selectors/network'
// import ReactGA from 'services/ga'
// import CommunityLogo from 'components/common/CommunityLogo'
// import { formatWei } from 'utils/format'
import { withRouter } from 'react-router-dom'
import GoogleImage from 'images/google-card.png'
import McdonaldsImage from 'images/mcdonalds.png'
import StarbucksImage from 'images/starbucks-card.png'
import WalmartImage from 'images/walmart.png'
import CommunityPlaceholderImage from 'images/community_placeholder.png'
// import { formatWei } from 'utils/format'
// import CommunityLogo from 'components/common/CommunityLogo'
import Community from 'components/common/Community'
import isEmpty from 'lodash/isEmpty'

const staticImages = [
  GoogleImage,
  McdonaldsImage,
  StarbucksImage,
  WalmartImage
]

class FeaturedCommunities extends Component {
  componentDidMount () {
    // if (this.props.networkType !== 'fuse') {
    //   this.props.fetchFuseToken()
    // }
    if (this.props.account) {
      const { networkType, account, fetchTokensByOwner } = this.props
      //   this.props.fetchTokens(networkType)
      fetchTokensByOwner(networkType, account)
    }
  }

  componentDidUpdate (prevProps) {
    if (this.props.account && !prevProps.account) {
      const { networkType, account, fetchTokensByOwner } = this.props
      // this.props.fetchTokens(networkType)
      fetchTokensByOwner(networkType, account)
    }
  }

  showDashboard = (communityAddress) => {
    this.props.history.push(`/view/community/${communityAddress}`)
    // ReactGA.event({
    //   category: 'Dashboard',
    //   action: 'Click',
    //   label: 'dashboard'
    // })
  }

  render () {
    const { metadata, networkType, account, history, communitiesKeys, communities } = this.props

    let filteredCommunities = []
    if (communitiesKeys) {
      filteredCommunities = communitiesKeys
        .map((communityAddress) => communities[communityAddress])
        .filter(obj => !!obj)
    }
    let communitiesIOwn = filteredCommunities.filter(({ isAdmin, token }) => isAdmin && token)

    return (
      <div className='grid-x align-justify grid-margin-x grid-margin-y'>
        {
          !isEmpty(communitiesIOwn) ? communitiesIOwn.slice(0, 4).map((entity) => {
            const { community: { communityAddress } } = entity
            return (
              <div className='cell medium-12'>
                <Community
                  networkType={networkType}
                  token={{ ...entity.token, communityAddress }}
                  metadata={metadata[entity.tokenURI]}
                  history={history}
                  account={account}
                  showDashboard={this.showDashboard}
                />
              </div>
            )
          }) : staticImages.map((img, index) =>
            <div key={index} className='medium-12 cell'><img src={CommunityPlaceholderImage} /></div>
          )
        }
      </div>
    )
  }
}

const mapStateToProps = state => ({
  tokens: state.entities.tokens,
  metadata: state.entities.metadata,
  account: getAccountAddress(state),
  foreignNetwork: getForeignNetwork(state),
  communities: state.entities.communities,
  networkType: state.network.networkType,
  communitiesKeys: state.accounts && state.accounts[state.network && state.network.accountAddress] && state.accounts[state.network && state.network.accountAddress].communities,
  ...state.screens.oven
})

const mapDispatchToProps = {
  fetchTokens,
  fetchTokensByOwner,
  loadModal,
  fetchFuseToken

}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(FeaturedCommunities))
