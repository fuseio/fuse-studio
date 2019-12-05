import React, { useEffect } from 'react'
import { connect, useSelector } from 'react-redux'
import FontAwesome from 'react-fontawesome'
import { formatAddress, formatWei } from 'utils/format'
import CopyToClipboard from 'components/common/CopyToClipboard'
import { fetchCommunities, fetchBalances, balanceOfToken } from 'actions/accounts'
import { changeNetwork } from 'actions/network'
import CommunityLogo from 'components/common/CommunityLogo'
import Avatar from 'images/avatar.svg'
import isEmpty from 'lodash/isEmpty'
import get from 'lodash/get'
import { getBalances, getAccount } from 'selectors/accounts'
import ArrowTiny from 'images/arrow_tiny.svg'
import { getNetworkSide } from 'selectors/network'
import MainnetLogo from 'images/Mainnet.svg'
import FuseLogo from 'images/fuseLogo.svg'
import { convertNetworkName } from 'utils/network'
import { SWITCH_NETWORK } from 'constants/uiConstants'
import { loadModal } from 'actions/ui'
import capitalize from 'lodash/capitalize'
import { loadState, saveState } from 'utils/storage'
import { push } from 'connected-react-router'

const mapStateToNativeBalanceProps = (state) => ({
  account: getAccount(state)
})

const NativeBalance = connect(mapStateToNativeBalanceProps, null)(({
  account,
  isMetaMask,
  isPortis
}) => {
  useEffect(() => {
    const { analytics } = window
    if (account && account.accountAddress) {
      analytics.identify(account.accountAddress,
        isPortis ? {
          subscriptionStatus: 'active',
          provider: 'Portis'
        } : isMetaMask ? {
          provider: 'Metamask'
        } : null)
    } else {
      analytics.identify({
        subscriptionStatus: 'inactive'
      })
    }
  }, [account])

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
            <span>{account && account.foreign ? formatWei((account.foreign), 2) : 0}&nbsp;</span>
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
            <span>{account && account.home ? formatWei((account && account.home), 2) : 0}&nbsp;</span>
            <span>FUSE</span>
          </p>
        </div>
      </div>
    </div>
  )
})

const ProfileCard = ({
  entity,
  metadata,
  balance,
  balanceOfToken,
  showDashboard,
  accountAddress
}) => {
  const { token, community } = entity
  const { name, symbol } = token
  const { homeTokenAddress, foreignTokenAddress, communityAddress } = community

  useEffect(() => {
    balanceOfToken(homeTokenAddress, accountAddress, { bridgeType: 'home' })
    balanceOfToken(foreignTokenAddress, accountAddress, { bridgeType: 'foreign' })
    return () => { }
  }, [])

  return (
    <div className='profile__card grid-x cell align-middle' onClick={() => showDashboard(communityAddress)}>
      <div className='profile__card__logo'>
        <CommunityLogo
          symbol={symbol}
          imageUrl={!isEmpty(get(metadata, 'image')) ? `${CONFIG.ipfsProxy.urlBase}/image/${get(metadata, 'image')}` : null}
          isSmall
          metadata={metadata}
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
              balanceOfToken={balanceOfToken}
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
  balanceOfToken,
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
  balances: getBalances(state),
  isPortis: state.network.isPortis,
  isMetaMask: state.network.isMetaMask
})

const mapDispatchToProps = {
  fetchCommunities,
  fetchBalances,
  balanceOfToken,
  changeNetwork,
  loadModal,
  push
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfileDropDown)
