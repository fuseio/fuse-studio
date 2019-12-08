import React, { useEffect } from 'react'
import isEmpty from 'lodash/isEmpty'
import capitalize from 'lodash/capitalize'
import { connect, useSelector } from 'react-redux'
import FontAwesome from 'react-fontawesome'
import { push } from 'connected-react-router'

import CopyToClipboard from 'components/common/CopyToClipboard'
import NativeBalance from 'components/common/NativeBalance'
import ProfileCard from 'components/common/ProfileCard'

import { getBalances } from 'selectors/accounts'
import { getNetworkSide } from 'selectors/network'
import { convertNetworkName } from 'utils/network'
import { formatAddress, formatWei } from 'utils/format'
import { SWITCH_NETWORK } from 'constants/uiConstants'
import { loadState, saveState } from 'utils/storage'
import { changeNetwork } from 'actions/network'
import { loadModal } from 'actions/ui'
import { fetchCommunities, fetchBalances } from 'actions/accounts'

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
  if (isEmpty(communities) || isEmpty(communities.filter(({ entity }) => entity))) return null

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
          const { community, token } = entity
          const { homeTokenAddress, foreignTokenAddress } = community
          const balance = balances[bridgeType === 'home' ? homeTokenAddress : foreignTokenAddress]
            ? formatWei(balances[bridgeType === 'home' ? homeTokenAddress : foreignTokenAddress], 2)
            : 0
          return (
            <ProfileCard
              key={index}
              balance={balance || 0}
              entity={entity}
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
  fetchCommunities,
  changeNetwork,
  isPortis,
  isMetaMask,
  loadModal,
  foreignNetwork,
  push
}) => {
  if (!accountAddress) return null

  useEffect(() => {
    if (accountAddress) {
      fetchCommunities(accountAddress)
    }
    return () => { }
  }, [accountAddress])

  const currentProvider = React.useMemo(() => loadState('state.provider'), [])

  let filteredCommunities = []
  if (communitiesKeys) {
    filteredCommunities = communitiesKeys
      .map((communityAddress) => communities[communityAddress])
      .filter(obj => !!obj)
  }
  let communitiesIOwn
  let communitiesIPartOf
  if (communities && typeof filteredCommunities.filter === 'function') {
    communitiesIOwn = filteredCommunities.filter(({ isAdmin, token }) => isAdmin && token).slice(0, 2)
    communitiesIPartOf = filteredCommunities.filter(({ isAdmin, token }) => !isAdmin && token).slice(0, 2)
  }

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
    if (isPortis) {
      if (foreignNetwork) {
        if (foreignNetwork === networkType) {
          changeNetwork('fuse')
        } else {
          changeNetwork(foreignNetwork)
        }
      } else {
        toggleNetwork()
      }
    } else if (isMetaMask) {
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
    }
  }

  const logout = () => {
    saveState('state.provider', {})
    saveState('state.reconnect', false)
    window.location.reload()
  }

  return (
    <div className='profile grid-y'>
      <div className='profile__account grid-x cell small-8 align-middle align-center'>
        <div className='profile__account__avatar cell small-24'>
          <img src={Avatar} />
        </div>
        <div className='cell small-24 profile__account__address grid-x align-middle align-center'>
          <span>{formatAddress(accountAddress)}</span>
          <CopyToClipboard text={accountAddress}>
            <FontAwesome name='clone' />
          </CopyToClipboard>
        </div>
        {currentProvider && currentProvider.provider && (
          <div onClick={logout} className='cell small-24 profile__account__logout grid-x align-middle align-center'>
            <span>Log out from {currentProvider.provider}</span>
          </div>
        )}
      </div>
      <div className='profile__communities grid-y'>
        <p className='profile__switch' onClick={switchNetwork}>
          <FontAwesome name='exchange-alt' />
          <span>Switch to {capitalize(convertNetworkName((foreignNetwork === networkType ? 'fuse' : foreignNetwork) || (networkType === 'ropsten' ? 'main' : 'ropsten')))} network</span>
        </p>
      </div>
      <NativeBalance isMetaMask={isMetaMask} isPortis={isPortis} />
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
  accountAddress: state.network && state.network.accountAddress,
  communitiesKeys: state.accounts && state.accounts[state.network && state.network.accountAddress] && state.accounts[state.network && state.network.accountAddress].communities,
  tokens: state.entities.tokens,
  metadata: state.entities.metadata,
  communities: state.entities.communities,
  networkType: state.network.networkType,
  balances: getBalances(state),
  isPortis: state.network.isPortis,
  isMetaMask: state.network.isMetaMask
})

const mapDispatchToProps = {
  fetchCommunities,
  fetchBalances,
  changeNetwork,
  loadModal,
  push
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfileDropDown)
