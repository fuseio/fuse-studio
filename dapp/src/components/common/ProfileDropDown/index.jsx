import React, { useEffect } from 'react'
import capitalize from 'lodash/capitalize'
import isEmpty from 'lodash/isEmpty'
import { connect, useSelector } from 'react-redux'
import FontAwesome from 'react-fontawesome'
import { push } from 'connected-react-router'

import CopyToClipboard from 'components/common/CopyToClipboard'
import NativeBalance from 'components/common/NativeBalance'
import ProfileCard from 'components/common/ProfileCard'
import { withAccount } from 'containers/Web3'

import { getBalances, getProviderInfo, getCommunitiesKeys } from 'selectors/accounts'
import { getNetworkSide, getCurrentNetworkType } from 'selectors/network'
import { convertNetworkName } from 'utils/network'
import { addressShortener, formatWei } from 'utils/format'
import { SWITCH_NETWORK } from 'constants/uiConstants'
import { changeNetwork } from 'actions/network'
import { loadModal } from 'actions/ui'
import { fetchBalances } from 'actions/accounts'

import Avatar from 'images/avatar.svg'

const InnerCommunities = ({
  fetchBalances,
  balances,
  accountAddress,
  communities,
  networkType,
  metadata,
  showDashboard,
  title
}) => {
  if (isEmpty(communities) || isEmpty(communities.filter(({ token }) => token))) return null

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
        {communities && communities.map((community, index) => {
          const { token } = community
          const { homeTokenAddress, foreignTokenAddress } = community
          const balance = balances[bridgeType === 'home' ? homeTokenAddress : foreignTokenAddress]
            ? formatWei(balances[bridgeType === 'home' ? homeTokenAddress : foreignTokenAddress], 2, token.decimals)
            : 0
          return (
            <ProfileCard
              key={index}
              balance={balance || 0}
              community={community}
              metadata={{ ...metadata[token.tokenURI], ...metadata[community && community.communityURI] }}
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
  changeNetwork,
  loadModal,
  foreignNetwork,
  push,
  providerInfo,
  handleLogOut
}) => {
  const communitiesIOwn = React.useMemo(() => {
    return communitiesKeys
      .map((communityAddress) => communities[communityAddress])
      .filter(obj => !!obj).filter(({ isAdmin, token }) => isAdmin && token).slice(0, 2)
  }, [communitiesKeys, communities])

  const communitiesIPartOf = React.useMemo(() => {
    return communitiesKeys
      .map((communityAddress) => communities[communityAddress])
      .filter(obj => !!obj).filter(({ isAdmin, token }) => !isAdmin && token).slice(0, 2)
  }, [communitiesKeys, communities])

  const showDashboard = (communityAddress) => {
    push(`/view/community/${communityAddress}`)
  }

  const loadSwitchModal = (desired) => {
    loadModal(SWITCH_NETWORK, { desiredNetworkType: [desired], networkType, goBack: false })
  }

  const toggleNetwork = () => {
    const network = networkType === 'fuse'
      ? (CONFIG.env === 'qa' || CONFIG.env === 'production')
        ? 'ropsten' : 'main'
      : networkType === 'ropsten'
        ? 'main' : 'ropsten'
    changeNetwork(network)
  }

  const switchNetwork = () => {
    if (providerInfo.type === 'injected') {
      if (foreignNetwork) {
        if (foreignNetwork === networkType) {
          loadSwitchModal('fuse')
        } else {
          loadSwitchModal(foreignNetwork)
        }
      } else {
        const desired = networkType === 'ropsten' ? 'main' : 'ropsten'
        loadSwitchModal(desired)
      }
    } else if (providerInfo.type === 'web') {
      if (foreignNetwork) {
        if (foreignNetwork === networkType) {
          changeNetwork('fuse')
        } else {
          changeNetwork(foreignNetwork)
        }
      } else {
        toggleNetwork()
      }
    }
  }

  const logout = () => {
    if (window && window.analytics) {
      window.analytics.reset()
    }
    handleLogOut()
    window.location.reload()
  }

  return (
    <div className='profile grid-y'>
      <div className='profile__account grid-x cell small-8 align-middle align-center'>
        <div className='profile__account__avatar cell small-24'>
          <img src={Avatar} />
        </div>
        <div className='cell small-24 profile__account__address grid-x align-middle align-center'>
          <span>{addressShortener(accountAddress)}</span>
          <CopyToClipboard text={accountAddress}>
            <FontAwesome name='clone' />
          </CopyToClipboard>
        </div>
        <div onClick={logout} className='cell small-24 profile__account__logout grid-x align-middle align-center'>
          <span>Log out from {providerInfo.check && providerInfo.check.substring && providerInfo.check.substring(2)}</span>
        </div>
      </div>
      <div className='profile__communities grid-y'>
        <p className='profile__switch' onClick={switchNetwork}>
          <FontAwesome name='exchange-alt' />
          <span>Switch to {capitalize(convertNetworkName((foreignNetwork === networkType ? 'fuse' : foreignNetwork) || (networkType === 'ropsten' ? 'main' : 'ropsten')))} network</span>
        </p>
      </div>
      <NativeBalance />
      <InnerCommunities
        showDashboard={showDashboard}
        communities={communitiesIOwn}
        networkType={networkType}
        accountAddress={accountAddress}
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
        metadata={metadata}
        fetchBalances={fetchBalances}
        balances={balances}
      />
    </div>
  )
}

const mapStateToProps = (state) => ({
  communitiesKeys: getCommunitiesKeys(state),
  providerInfo: getProviderInfo(state),
  tokens: state.entities.tokens,
  metadata: state.entities.metadata,
  communities: state.entities.communities,
  networkType: getCurrentNetworkType(state),
  balances: getBalances(state)
})

const mapDispatchToProps = {
  fetchBalances,
  changeNetwork,
  loadModal,
  push
}

export default withAccount(connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfileDropDown))
