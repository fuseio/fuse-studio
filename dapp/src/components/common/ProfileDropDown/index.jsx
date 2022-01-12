import React from 'react'
import capitalize from 'lodash/capitalize'
import { useDispatch, useSelector } from 'react-redux'
import FontAwesome from 'react-fontawesome'

import CopyToClipboard from 'components/common/CopyToClipboard'
import NativeBalance from 'components/common/NativeBalance'
import { withAccount } from 'containers/Web3'

import { getProviderInfo } from 'selectors/accounts'
import { getCurrentNetworkType } from 'selectors/network'
import { convertNetworkName } from 'utils/network'
import { addressShortener } from 'utils/format'
import { SWITCH_NETWORK } from 'constants/uiConstants'
import { changeNetwork } from 'actions/network'
import { loadModal } from 'actions/ui'
import { logout } from 'actions/user'

import Avatar from 'images/avatar.svg'

const ProfileDropDown = ({
  accountAddress,
  foreignNetwork,
  handleDisconnect
}) => {
  const providerInfo = useSelector(getProviderInfo)
  const networkType = useSelector(getCurrentNetworkType)
  const dispatch = useDispatch()

  const loadSwitchModal = (desired) => {
    dispatch(loadModal(SWITCH_NETWORK, { desiredNetworkType: [desired], networkType, goBack: false }))
  }

  const toggleNetwork = () => {
    const network = networkType === 'fuse' ? 'main' : 'fuse'
    // ? (CONFIG.env === 'qa')
    //     ? 'ropsten'
    //     : 'main'
    // : networkType === 'ropsten'
    //   ? 'main'
    //   : 'main'
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
        // const desired = networkType === 'ropsten' ? 'main' : 'ropsten'
        loadSwitchModal('main')
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
    </div>
  )
}

export default withAccount(ProfileDropDown)
