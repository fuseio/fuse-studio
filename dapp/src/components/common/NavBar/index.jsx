import React, { useRef, useState } from 'react'
import { connect, useDispatch } from 'react-redux'
import Logo from 'components/common/Logo'
import HelpIcon, { ReactComponent as Help } from 'images/help.svg'

import LoginIcon from 'images/login.svg'
import WalletIcon from 'images/fuse-wallet.svg'
import NewWalletIcon from 'images/new_wallet.svg'
import classNames from 'classnames'
import ProfileDropDown from 'components/common/ProfileDropDown'
import { isMobile } from 'react-device-detect'
import { withRouter } from 'react-router'
import capitalize from 'lodash/capitalize'
import { convertNetworkName } from 'utils/network'
import { push } from 'connected-react-router'
import { useWindowScroll } from 'react-use'
import useOutsideClick from 'hooks/useOutsideClick'
import { getCurrentNetworkType } from 'selectors/network'
import { getForeignTokenByCommunityAddress } from 'selectors/token'
import { getCommunityAddress } from 'selectors/entities'
import { loadModal } from 'actions/ui'
import { LOGIN_MODAL } from 'constants/uiConstants'

const NavBar = ({
  accountAddress,
  networkType,
  connectingToWallet,
  foreignToken,
  location,
  handleConnect,
  handleDisconnect,
  isLoggedIn
}) => {
  const isInIssuancePage = location.pathname.includes('/issuance')

  if (isInIssuancePage) {
    return null
  }
  const dispatch = useDispatch()
  const isInCommunityPage = location.pathname.includes('/community/') || location.pathname.includes('/fuse-community/')
  const isInNestedCommunityPage = isInCommunityPage && !location.pathname.includes('justCreated') && location.pathname.split('/').length > 4
  const modifier = isInCommunityPage
  const withLogo = !isInCommunityPage

  const { y: scrollY } = useWindowScroll()
  const [isHelpOpen, setHelpOpen] = useState(false)
  const [isProfileOpen, setProfileOpen] = useState(false)
  const helpRef = useRef(null)
  const profileRef = useRef(null)

  useOutsideClick(profileRef, () => {
    if (isProfileOpen) {
      setProfileOpen(false)
    }
  })

  useOutsideClick(helpRef, () => {
    if (isHelpOpen) {
      setHelpOpen(false)
    }
  })

  const openProfile = (e) => {
    e.stopPropagation()
    setProfileOpen(!isProfileOpen)
  }

  const openHelp = (e) => {
    e.stopPropagation()
    setHelpOpen(!isHelpOpen)
  }

  const handleLogin = (e) => {
    e.stopPropagation()
    if (!isLoggedIn) {
      dispatch(loadModal(LOGIN_MODAL, { handleConnect }))
    } else if (isLoggedIn) {
      handleConnect()
    }
  }

  const renderButton = () => {
    if (connectingToWallet) {
      return (
        <div className='navbar__links__wallet navbar__connecting'>
          <span className='navbar__links__wallet__text'>Connecting to wallet</span>
          <span className='animate'>.</span>
          <span className='animate'>.</span>
          <span className='animate'>.</span>
        </div>
      )
    } else if (!isLoggedIn) {
      return (
        <div className='navbar__links__wallet navbar__links__wallet--pointer' onClick={handleLogin}>
          <span className='icon'><img src={LoginIcon} /></span>
          <span className='navbar__links__wallet__text'>Login</span>
        </div>
      )
    } else if (isLoggedIn && !accountAddress) {
      return (
        <div className='navbar__links__wallet navbar__links__wallet--pointer' onClick={handleConnect}>
          <span className='icon'><img src={WalletIcon} /></span>
          <span className='navbar__links__wallet__text'>Connect wallet</span>
        </div>
      )
    } else {
      return (
        <div
          className='navbar__links__wallet navbar__links__wallet--pointer'
          ref={profileRef}
          onClick={openProfile}
        >
          <span className='icon'><img src={isInCommunityPage ? NewWalletIcon : WalletIcon} /></span>
          <span className='navbar__links__wallet__text'>{capitalize(convertNetworkName(networkType))} network</span>
          <div className={classNames('drop drop--profile', { 'drop--show': isProfileOpen })}>
            <ProfileDropDown handleDisconnect={handleDisconnect} foreignNetwork={(foreignToken && foreignToken.networkType) === 'mainnet' ? 'main' : (foreignToken && foreignToken.networkType)} />
          </div>
        </div>
      )
    }
  }

  const handlePricing = () => {
    dispatch(push('/view/price'))
  }

  const isGreaterThen70 = () => scrollY > 70

  return (
    <div className={classNames('navbar',
      {
        'navbar--scroll': isGreaterThen70(),
        'navbar--short': modifier && !isMobile,
        'navbar--fixed': isInNestedCommunityPage,
        'navbar--bgImage': !isInNestedCommunityPage
      })}
    >
      {(withLogo || (isMobile && isGreaterThen70())) && (
        <div className='navbar__logo'>
          <Logo showHomePage={() => dispatch(push('/'))} isBlue={false} />
        </div>
      )}
      <div className='navbar__links' style={{ marginLeft: !withLogo ? 'auto' : null }}>
        <div
          className='navbar__link'
          onClick={handlePricing}
        >
          Pricing
        </div>
        <div
          className='navbar__links__help'
          ref={helpRef}
          onClick={openHelp}
        >
          <span className='icon'>{isInCommunityPage ? <Help className='help' /> : <img src={HelpIcon} />}</span>
          <div style={{ minWidth: '130px' }} className={classNames('drop', { 'drop--show': isHelpOpen })}>
            <ul className='drop__options'>
              <li className='drop__options__item'><a href='https://fuse.io' target='_blank' rel='noopener noreferrer'>Website</a></li>
              <li className='drop__options__item'><a href='https://tutorials.fuse.io/tutorials/studio-tutorials' target='_blank' rel='noopener noreferrer'>FAQ</a></li>
              <li className='drop__options__item'><a href='https://github.com/fuseio' target='_blank'>Github</a></li>
              <li className='drop__options__item'><a href='mailto:hello@fuse.io'>Contact us</a></li>
            </ul>
          </div>
        </div>
        {renderButton()}
      </div>
    </div>
  )
}

const mapStateToProps = (state) => ({
  accountAddress: state.network.accountAddress,
  connectingToWallet: state.network.connectingToWallet,
  networkType: getCurrentNetworkType(state),
  foreignToken: getForeignTokenByCommunityAddress(state, getCommunityAddress(state)) || { networkType: '' },
  location: state.router.location,
  isLoggedIn: state.user.isLoggedIn
})

export default withRouter(connect(mapStateToProps, null)(NavBar))
