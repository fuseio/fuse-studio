import React, { useEffect } from 'react'
import capitalize from 'lodash/capitalize'
import isEmpty from 'lodash/isEmpty'
import { connect, useSelector, useDispatch } from 'react-redux'
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
import { logout } from 'actions/user'

import Avatar from 'images/avatar.svg'

const InnerCommunities = ({
  accountAddress,
  communities,
  networkType,
  showDashboard,
  title
}) => {
  if (isEmpty(communities) || isEmpty(communities.filter(({ token }) => token))) return null
  const metadata = useSelector(state => state.entities.metadata)
  const balances = useSelector(getBalances)
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
  networkType,
  accountAddress,
  communitiesKeys,
  communities,
  foreignNetwork,
  providerInfo,
  handleDisconnect
}) => {
  const dispatch = useDispatch()
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
    dispatch(push(`/view/community/${communityAddress}`))
  }

  const loadSwitchModal = (desired) => {
    dispatch(loadModal(SWITCH_NETWORK, { desiredNetworkType: [desired], networkType, goBack: false }))
  }

  const toggleNetwork = () => {
    const network = networkType === 'fuse'
      ? (CONFIG.env === 'qa' || CONFIG.env === 'production')
        ? 'ropsten' : 'main'
      : networkType === 'ropsten'
        ? 'main' : 'ropsten'
    dispatch(changeNetwork(network))
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
          dispatch(changeNetwork('fuse'))
        } else {
          dispatch(changeNetwork(foreignNetwork))
        }
      } else {
        toggleNetwork()
      }
    }
  }

  const disconnectWallet = () => {
    handleDisconnect()
    window.location.reload()
  }

  const handleLogout = () => {
    handleDisconnect()
    dispatch(logout())
    window.location.reload()
  }

  return (
    <div className='profile grid-y'>
      <div className='profile__account grid-x cell small-8 align-middle align-center'>
        <div className='logout' onClick={handleLogout}>
          <span>Logout</span>
        </div>
        <div className='profile__account__avatar cell small-24'>
          <img src={Avatar} />
        </div>
        <div className='cell small-24 profile__account__address grid-x align-middle align-center'>
          <span>{addressShortener(accountAddress)}</span>
          <CopyToClipboard text={accountAddress}>
            <FontAwesome name='clone' />
          </CopyToClipboard>
        </div>
        <div className='cell small-24 profile__account__disconnect grid-x align-middle align-center'>
          <span>Connected to {providerInfo.check && providerInfo.check.substring && providerInfo.check.substring(2)}&nbsp;</span>
          <span onClick={disconnectWallet} className='disconnect'>(Disconnect)</span>
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
        title='Economy I own'
      />
      <InnerCommunities
        showDashboard={showDashboard}
        title='Economy I am part'
        communities={communitiesIPartOf}
        networkType={networkType}
        accountAddress={accountAddress}
      />
    </div>
  )
}

const mapStateToProps = (state) => ({
  communitiesKeys: getCommunitiesKeys(state),
  providerInfo: getProviderInfo(state),
  communities: state.entities.communities,
  networkType: getCurrentNetworkType(state)
})

export default withAccount(connect(mapStateToProps, null)(ProfileDropDown))
