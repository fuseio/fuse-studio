import React, { useEffect } from 'react'
import { connect, useSelector } from 'react-redux'
import FontAwesome from 'react-fontawesome'
import { formatAddress } from 'utils/format'
import CopyToClipboard from 'components/common/CopyToClipboard'
import { fetchCommunities, fetchBalances, balanceOfToken, balanceOfNative } from 'actions/accounts'
import CommunityLogo from 'components/common/CommunityLogo'
import Avatar from 'images/avatar.svg'
import isEmpty from 'lodash/isEmpty'
import { withRouter } from 'react-router-dom'
import ReactGA from 'services/ga'
import { getBalances, getAccount } from 'selectors/accounts'
import { BigNumber } from 'bignumber.js'
import ArrowTiny from 'images/arrow_tiny.svg'
import { getNetworkSide } from 'selectors/network'
import MainnetLogo from 'images/Mainnet.svg'
import FuseLogo from 'images/fuseLogo.svg'

const mapStateToNativeBalanceProps = (state) => ({
  account: getAccount(state)
})

const mapDispatchToNativeBalanceProps = {
  balanceOfNative
}

const NativeBalance = connect(mapStateToNativeBalanceProps, mapDispatchToNativeBalanceProps)(({
  accountAddress,
  balanceOfNative,
  account
}) => {
  useEffect(() => {
    if (accountAddress) {
      balanceOfNative(accountAddress, { bridgeType: 'home' })
      balanceOfNative(accountAddress, { bridgeType: 'foreign' })
    }
  }, [accountAddress])

  const homeBalance = new BigNumber(account && account.home).div(1e18).toFormat(2, 1)
  const foreignBalance = new BigNumber(account && account.foreign).div(1e18).toFormat(2, 1)

  return (
    <div className='profile__communities grid-y'>
      <span>My balance</span>
      <div className='profile__card grid-x cell align-middle'>
        <div className='profile__card__logo'>
          <img src={MainnetLogo} />
        </div>
        <div className='cell auto grid-y profile__card__content'>
          <h5 className='profile__card__title'>Ethereum Network</h5>
          <p className='profile__card__balance'>
            <span>Balance:&nbsp;</span>
            <span>{foreignBalance}&nbsp;</span>
            <span>ETH</span>
          </p>
        </div>
      </div>
      <div className='profile__card grid-x cell align-middle'>
        <div className='profile__card__logo'>
          <img src={FuseLogo} />
        </div>
        <div className='cell auto grid-y profile__card__content'>
          <h5 className='profile__card__title'>Fuse Network</h5>
          <p className='profile__card__balance'>
            <span>Balance:&nbsp;</span>
            <span>{homeBalance}&nbsp;</span>
            <span>FUSE</span>
          </p>
        </div>
      </div>
    </div>
  )
})

const ProfileCard = ({
  entity,
  networkType,
  metadata,
  balance,
  balanceOfToken,
  showDashboard,
  accountAddress
}) => {
  const { token: { name, symbol }, community: { homeTokenAddress, foreignTokenAddress } } = entity

  useEffect(() => {
    balanceOfToken(homeTokenAddress, accountAddress, { bridgeType: 'home' })
    balanceOfToken(foreignTokenAddress, accountAddress, { bridgeType: 'foreign' })
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
  accountAddress,
  communities,
  networkType,
  metadata,
  showDashboard,
  balanceOfToken,
  title
}) => {
  if (isEmpty(communities)) return null

  useEffect(() => {
    if (communities && accountAddress) {
      fetchBalances(communities.map(({ token }) => token), accountAddress)
    }
    return () => { }
  }, [accountAddress, communities])

  const bridgeType = useSelector(getNetworkSide)
  return (
    <div className='profile__communities grid-y'>
      <span>{title}</span>
      <div className='grid-y grid-margin-y grid-margin-x'>
        {communities && communities.map((entity, index) => {
          const { community: { homeTokenAddress, foreignTokenAddress } } = entity
          const balance = new BigNumber(balances[bridgeType === 'home' ? homeTokenAddress : foreignTokenAddress]).div(1e18).toFormat(2, 1)
          return (
            <ProfileCard
              key={index}
              balance={balance || 0}
              balanceOfToken={balanceOfToken}
              entity={entity}
              metadata={metadata}
              showDashboard={showDashboard}
              accountAddress={accountAddress}
              networkType={networkType}
            />
          )
        }
        )}
      </div>
    </div>
  )
}

const ProfileDropDown = ({
  metadata,
  balances,
  networkType,
  accountAddress,
  communitiesKeys,
  communities,
  history,
  fetchCommunities,
  balanceOfToken
}) => {
  useEffect(() => {
    if (accountAddress) {
      fetchCommunities(accountAddress)
    }
    return () => { }
  }, [accountAddress])

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

  const showDashboard = (communityAddress) => {
    history.push(`/view/community/${communityAddress}`)
    ReactGA.event({
      category: 'Dashboard',
      action: 'Click',
      label: 'dashboard'
    })
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
      <NativeBalance
        balance={0}
        accountAddress={accountAddress}
      />
      <InnerCommunities
        showDashboard={showDashboard}
        communities={communitiesIOwn}
        networkType={networkType}
        accountAddress={accountAddress}
        balanceOfToken={balanceOfToken}
        metadata={metadata}
        balances={balances}
        fetchBalances={fetchBalances}
        title='Community I own'
      />
      <InnerCommunities
        showDashboard={showDashboard}
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
