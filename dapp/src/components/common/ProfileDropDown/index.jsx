import React, { Component, useEffect } from 'react'
import { connect } from 'react-redux'
import FontAwesome from 'react-fontawesome'
import { formatAddress } from 'utils/format'
import CopyToClipboard from 'components/common/CopyToClipboard'
import { fetchCommunities, fetchBalances, balanceOfToken } from 'actions/accounts'
import CommunityLogo from 'components/common/CommunityLogo'
import Avatar from 'images/avatar.svg'
import isEmpty from 'lodash/isEmpty'
import { withRouter } from 'react-router-dom'
import ReactGA from 'services/ga'
import { getBalances } from 'selectors/accounts'
import { BigNumber } from 'bignumber.js'
import ArrowTiny from 'images/arrow_tiny.svg'

const ProfileCard = ({
  accountAddress,
  entity,
  networkType,
  metadata,
  balance,
  balanceOfToken,
  showDashboard
}) => {
  const { token: { name, symbol, address } } = entity

  useEffect(() => {
    balanceOfToken(address, accountAddress, { bridgeType: networkType === 'fuse' ? 'home' : 'foreign' })
  }, [])

  return (
    <div className='profile__card grid-x cell align-middle' onClick={() => showDashboard(entity.communityAddress)}>
      <div className='profile__card__logo'>
        <CommunityLogo
          isDaiToken={entity.token && entity.token.symbol === 'DAI'}
          networkType={networkType}
          imageUrl={!isEmpty(metadata[entity.token.tokenURI] && metadata[entity.token.tokenURI].image) ? `${CONFIG.ipfsProxy.urlBase}/image/${metadata[entity.token.tokenURI].image}` : null}
          token={entity.token}
          isSmall
          metadata={(entity.token && entity.token.tokenURI && metadata[entity.token.tokenURI]) || {}}
        />
      </div>
      <div className='cell auto grid-y profile__card__content'>
        <h5 className='profile__card__title'>{name}</h5>
        <p className='profile__card__balance'>
          <span>Balance:&nbsp;</span>
          <span>{balance}&nbsp;</span>
          <span>{symbol}</span>
        </p>
      </div>
      <div className='profile__card__arrow'>
        <img src={ArrowTiny} />
      </div>
    </div>
  )
}

const InnerCommunities = ({
  fetchBalances,
  balances,
  balanceOfToken,
  accountAddress,
  communities,
  networkType,
  metadata,
  showDashboard,
  title
}) => {
  if (isEmpty(communities)) return null

  useEffect(() => {
    if (communities) {
      fetchBalances(communities.map(({ token }) => token), accountAddress)
    }
  }, [])

  return (
    <div className='profile__communities grid-y'>
      <span>{title}</span>
      <div className='grid-y grid-margin-y grid-margin-x'>
        {communities && communities.map((entity, index) => {
          const { token: { address } } = entity
          return (
            <ProfileCard
              key={index}
              balance={balances[address]
                ? new BigNumber(balances[address]).div(1e18).toFormat(2, 1)
                : 0}
              entity={entity}
              metadata={metadata}
              showDashboard={showDashboard}
              accountAddress={accountAddress}
              balanceOfToken={balanceOfToken}
              networkType={networkType}
            />
          )
        }
        )}
      </div>
    </div>
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
    const {
      accountAddress,
      communities,
      metadata,
      networkType,
      communitiesKeys,
      balanceOfToken,
      balances,
      fetchBalances
    } = this.props

    let filteredCommunities = []
    if (communitiesKeys) {
      filteredCommunities = communitiesKeys
        .map((communityAddress) => communities[communityAddress])
        .filter(obj => !!obj)
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
          {accountAddress && <span className='cell small-24 profile__account__address'>
            {formatAddress(accountAddress)}
            <CopyToClipboard text={accountAddress}>
              <FontAwesome name='clone' />
            </CopyToClipboard>
          </span>}
        </div>
        <InnerCommunities
          showDashboard={this.showDashboard}
          communities={communitiesIOwn}
          networkType={networkType}
          accountAddress={accountAddress}
          metadata={metadata}
          balanceOfToken={balanceOfToken}
          balances={balances}
          fetchBalances={fetchBalances}
          title='Community I own'
        />
        <InnerCommunities
          showDashboard={this.showDashboard}
          title='Community I am part'
          communities={communitiesIPartOf}
          networkType={networkType}
          accountAddress={accountAddress}
          balanceOfToken={balanceOfToken}
          metadata={metadata}
          fetchBalances={fetchBalances}
          balances={balances}
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
  networkType: state.network.networkType,
  balances: getBalances(state)
})

const mapDispatchToProps = {
  fetchCommunities,
  fetchBalances,
  balanceOfToken
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfileDropDown))
