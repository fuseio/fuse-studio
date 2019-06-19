import React, { Component } from 'react'
import { connect } from 'react-redux'
import FontAwesome from 'react-fontawesome'
import { formatAddress, formatWei } from 'utils/format'
import CopyToClipboard from 'components/common/CopyToClipboard'
import { fetchCommunities } from 'actions/accounts'
import { isMobileOnly } from 'react-device-detect'
import CommunityLogo from 'components/common/CommunityLogo'
import Avatar from 'images/avatar.svg'
import isEmpty from 'lodash/isEmpty'
import { withRouter } from 'react-router-dom'
import ReactGA from 'services/ga'

const InnerCommunities = ({ communities, networkType, metadata, showDashboard, title = 'Community I own' }) => {
  if (isEmpty(communities)) return null
  return (
    <React.Fragment>
      <div className='profile__communities grid-y'>
        <span>{title}</span>
        <div className='grid-y grid-margin-y grid-margin-x'>
          {communities && communities.map((entity, index) => {
            return (
              <div className='community cell' key={index} onClick={() => showDashboard(entity.communityAddress)}>
                <div className='community__logo'>
                  <CommunityLogo
                    isDaiToken={entity.token && entity.token.symbol === 'DAI'}
                    networkType={networkType}
                    token={entity.token}
                    isSmall={isMobileOnly}
                    metadata={(entity.token && entity.token.tokenURI && metadata[entity.token.tokenURI]) || {}}
                  />
                </div>
                <div className='community__content'>
                  <h3 className='community__content__title'>{entity.token && entity.token.name}</h3>
                  <p className='community__content__members'>
                    Total Supply
                    <span>
                      {formatWei(entity.token && entity.token.totalSupply, 0)}
                    </span>
                  </p>
                </div>
              </div>
            )
          }
          )}
        </div>
      </div>
    </React.Fragment>
  )
}

class ProfileDropDown extends Component {
  componentDidUpdate (prevProps) {
    const { accountAddress } = this.props
    if (accountAddress !== prevProps.accountAddress) {
      const { fetchCommunities, accountAddress } = this.props
      fetchCommunities(accountAddress)
    }
  }

  showDashboard = (communityAddress) => {
    this.props.history.push(`/view/community/${communityAddress}`)
    ReactGA.event({
      category: 'Dashboard',
      action: 'Click',
      label: 'dashboard'
    })
  }

  render () {
    const { accountAddress, communities, metadata, networkType, communitiesKeys } = this.props

    let filteredCommunities = []
    if (communitiesKeys) {
      filteredCommunities = communitiesKeys
        .map((communityAddress) => {
          return communities[communityAddress]
        }).filter(obj => !!obj)
    }
    let communitiesIOwn
    let communitiesIPartOf
    if (communities && typeof filteredCommunities.filter === 'function') {
      communitiesIOwn = filteredCommunities.filter(({ isAdmin, token }) => isAdmin && token)
      communitiesIPartOf = filteredCommunities.filter(({ isAdmin, token }) => !isAdmin && token)
    }
    return (
      <div className='profile grid-y'>
        <div className='profile__account grid-x cell small-8 align-middle align-center'>
          <div className='profile__account__avatar cell small-24'>
            <img src={Avatar} />
          </div>
          <span className='cell small-24 profile__account__address'>
            {formatAddress(accountAddress)}
            <CopyToClipboard text={accountAddress}>
              <FontAwesome name='clone' />
            </CopyToClipboard>
          </span>
        </div>
        <InnerCommunities
          showDashboard={this.showDashboard}
          communities={communitiesIOwn}
          networkType={networkType}
          metadata={metadata}
        />
        <InnerCommunities
          showDashboard={this.showDashboard}
          title='Community I am part'
          communities={communitiesIPartOf}
          networkType={networkType}
          metadata={metadata}
        />
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  accountAddress: state.network && state.network.accountAddress,
  communitiesKeys: state.accounts && state.accounts[state.network && state.network.accountAddress] && state.accounts[state.network && state.network.accountAddress].communities,
  tokens: state.entities.tokens,
  metadata: state.entities.metadata,
  communities: state.entities.communities,
  networkType: state.network.networkType
})

const mapDispatchToProps = {
  fetchCommunities
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfileDropDown))
