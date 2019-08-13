import React, { Component } from 'react'
import { connect } from 'react-redux'
import { fetchTokens, fetchTokensByOwner, fetchFuseToken } from 'actions/token'
import { loadModal } from 'actions/ui'
import { getAccountAddress } from 'selectors/accounts'
import { getForeignNetwork } from 'selectors/network'
import ReactGA from 'services/ga'
// import CommunityLogo from 'components/common/CommunityLogo'
// import { formatWei } from 'utils/format'
import { withRouter } from 'react-router-dom'
import GoogleImage from 'images/google-card.png'
import McdonaldsImage from 'images/mcdonalds.png'
import StarbucksImage from 'images/starbucks-card.png'
import WalmartImage from 'images/walmart.png'

const staticImages = [
  GoogleImage,
  McdonaldsImage,
  StarbucksImage,
  WalmartImage
]

class FeaturedCommunities extends Component {
  componentDidMount () {
    if (this.props.networkType !== 'fuse') {
      this.props.fetchFuseToken()
    }
    if (this.props.account) {
      const { networkType, account } = this.props
      this.props.fetchTokens(networkType)
      this.props.fetchTokensByOwner(networkType, account)
    }
  }

  componentDidUpdate (prevProps) {
    if (this.props.account && !prevProps.account) {
      const { networkType, account } = this.props
      this.props.fetchTokens(networkType)
      this.props.fetchTokensByOwner(networkType, account)
    }
  }

  showDashboard = (token) => {
    if (token && token.communityAddress) {
      this.props.history.push(`/view/community/${token.communityAddress}`)
      ReactGA.event({
        category: 'Dashboard',
        action: 'Click',
        label: 'dashboard'
      })
    }
  }

  render () {
    // const { addresses, tokens, metadata, networkType } = this.props
    return (
      <div className='grid-x align-justify grid-margin-x grid-margin-y'>
        {
          staticImages.map((img, index) =>
            <div key={index} className='medium-12 cell'><img src={img} /></div>
          )
        }
        {/* {
          addresses.slice(0, 4).map(address => {
            return (
              <div className='community medium-11 cell' style={{ minHeight: '120px' }} key={address} onClick={() => this.showDashboard(tokens[address])}>
                <div className='community__logo'>
                  <CommunityLogo
                    isDaiToken={tokens[address] && tokens[address].symbol && tokens[address].symbol === 'DAI'}
                    token={tokens[address]}
                    networkType={networkType}
                    metadata={metadata[tokens[address].tokenURI] || {}}
                  />
                </div>
                <div className='community__content'>
                  <h3 className='community__content__title'>{tokens[address] && tokens[address].name}</h3>
                  <p className='community__content__members'>
                    Total Supply
                    <span>
                      {formatWei(tokens[address] && tokens[address].totalSupply, 0)}
                    </span>
                  </p>
                </div>
              </div>
            )
          })
        } */}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  tokens: state.entities.tokens,
  metadata: state.entities.metadata,
  account: getAccountAddress(state),
  foreignNetwork: getForeignNetwork(state),
  networkType: state.network.networkType,
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
