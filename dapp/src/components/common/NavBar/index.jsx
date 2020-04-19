import React, { useRef, useState } from 'react'
import { connect } from 'react-redux'
import Logo from 'components/common/Logo'
import HelpIcon from 'images/help.svg'
import NotificationIcon from 'images/notification.svg'
import WalletIcon from 'images/fuse-wallet.svg'
import LoginIcon from 'images/login.svg'
import classNames from 'classnames'
import ProfileDropDown from 'components/common/ProfileDropDown'
import LoginDropDown from 'components/common/LoginDropDown'
import { isMobileOnly } from 'react-device-detect'
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
import { WEB3_CONNECT_MODAL } from 'constants/uiConstants'

const NavBar = ({
  accountAddress,
  networkType,
  push,
  connectingToWallet,
  logout,
  web3connect,
  foreignToken,
  location,
  loadModal,
  isLoggedIn
}) => {
  const isInCommunityPage = location.pathname.includes('/community/')
  const isInIssuancePage = location.pathname.includes('/issuance')

  if (isInIssuancePage) {
    return null
  }

  const modifier = isInCommunityPage
  const withLogo = !isInCommunityPage

  const { y: scrollY } = useWindowScroll()
  const [isHelpOpen, setHelpOpen] = useState(false)
  const [isProfileOpen, setProfileOpen] = useState(false)
  const [isLoginOpen, setLoginOpen] = useState(false)
  const helpRef = useRef(null)
  const profileRef = useRef(null)
  const loginRef = useRef(null)

  useOutsideClick(profileRef, () => {
    if (isProfileOpen) {
      setProfileOpen(false)
    }
  })

  useOutsideClick(loginRef, () => {
    if (isLoginOpen) {
      setLoginOpen(false)
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

  const handleConnect = (e) => {
    loadModal(WEB3_CONNECT_MODAL, { web3connect })
  }

  const handleLogin = (e) => {
    e.stopPropagation()
    setLoginOpen(!isLoginOpen)
  }

  const isGreaterThen70 = () => scrollY > 70

  return (
    <div className={classNames('navbar', { 'navbar--scroll': isGreaterThen70(), 'navbar--short': modifier })} >
      {(withLogo || (isMobileOnly && isGreaterThen70())) && <div className='navbar__logo'>
        <Logo showHomePage={() => push('/')} isBlue={!isGreaterThen70()} />
      </div>}
      <div className='navbar__links' style={{ marginLeft: !withLogo ? 'auto' : null }}>
        <div
          className='navbar__links__help'
          ref={helpRef}
          onClick={openHelp}
        >
          <span className='icon'><img src={HelpIcon} /></span>
          <div style={{ minWidth: '130px' }} className={classNames('drop', { 'drop--show': isHelpOpen })}>
            <ul className='drop__options'>
              <li className='drop__options__item'><a href='https://fuse.io' target='_blank' rel='noopener noreferrer'>Website</a></li>
              <li className='drop__options__item'><a href='https://docs.fuse.io/the-fuse-studio/faq' target='_blank' rel='noopener noreferrer'>FAQ</a></li>
              <li className='drop__options__item'><a href='https://github.com/fuseio' target='_blank'>Github</a></li>
              <li className='drop__options__item'><a href='mailto:hello@fuse.io'>Contact us</a></li>
            </ul>
          </div>
        </div>
        <div className='navbar__links__notification'>
          <span className='icon'><img src={NotificationIcon} /></span>
        </div>
        {
          isLoggedIn ? (
            accountAddress ? (
              <div
                className='navbar__links__wallet'
                ref={profileRef}
                onClick={openProfile}
              >
                <span className='icon'><img src={WalletIcon} /></span>
                <span className='navbar__links__wallet__text'>{capitalize(convertNetworkName(networkType))} network</span>
                <div className={classNames('drop drop--profile', { 'drop--show': isProfileOpen })}>
                  <ProfileDropDown handleLogOut={() => logout()} foreignNetwork={(foreignToken && foreignToken.networkType) === 'mainnet' ? 'main' : (foreignToken && foreignToken.networkType)} />
                </div>
              </div>
            ) : connectingToWallet ? (
              <div className='navbar__links__wallet navbar__connecting'>
                <span className='navbar__links__wallet__text'>Connecting to wallet</span>
                <span className='animate'>.</span>
                <span className='animate'>.</span>
                <span className='animate'>.</span>
              </div>
            ) : (
              <div className='navbar__links__wallet' onClick={handleConnect}>
                <span className='icon'><img src={WalletIcon} /></span>
                <span className='navbar__links__wallet__text'>Connect wallet</span>
              </div>
            )
          ) : (
            <div ref={loginRef} className='navbar__links__wallet' onClick={handleLogin}>
              <span className='icon'><img src={LoginIcon} /></span>
              <span className='navbar__links__wallet__text'>Login</span>
              <div className={classNames('drop drop--profile', { 'drop--show': isLoginOpen })}>
                <LoginDropDown />
              </div>
            </div>
          )
        }
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

const mapDispatchToProps = {
  push,
  loadModal
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NavBar))
