import React, { useEffect, useRef, useState, useCallback } from 'react'
import { connect } from 'react-redux'
import Logo from 'components/common/Logo'
import HelpIcon from 'images/help.svg'
import NotificationIcon from 'images/notification.svg'
import WalletIcon from 'images/fuse-wallet.svg'
import classNames from 'classnames'
import ProfileDropDown from './../ProfileDropDown'
import { isMobileOnly } from 'react-device-detect'
import { withRouter } from 'react-router'
import capitalize from 'lodash/capitalize'
import { convertNetworkName } from 'utils/network'
import { push } from 'connected-react-router'

import useOutsideClick from 'hooks/useOutsideClick'

const NavBar = ({
  accountAddress,
  networkType,
  foreignNetwork,
  push,
  connectingToWallet,
  logout,
  web3connect,
  withLogo = true
}) => {
  const [isHelpOpen, setHelpOpen] = useState(false)
  const [isProfileOpen, setProfileOpen] = useState(false)
  const [scrollTop, setScrollTop] = useState(false)
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

  const handleScroll = useCallback(event => {
    let lastScrollY = window.scrollY
    setProfileOpen(false)
    setHelpOpen(false)
    setScrollTop(lastScrollY)
  }, [])

  useEffect(() => {
    document.addEventListener('scroll', handleScroll)
    return () => {
      document.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  // const chooseProvider = () => {
  //   if (!accountAddress) {
  //     if (window && window.analytics) {
  //       window.analytics.track('Connect wallet clicked - not connected')
  //     }
  //     loadModal(CHOOSE_PROVIDER)
  //   }
  // }

  const openProfile = (e) => {
    e.stopPropagation()
    setProfileOpen(!isProfileOpen)
  }

  const openHelp = (e) => {
    e.stopPropagation()
    setHelpOpen(!isHelpOpen)
  }

  return (
    <div className={classNames('navbar', { 'navbar--scroll': scrollTop > 70 })} >
      {(withLogo || (isMobileOnly && scrollTop > 70)) && <div className='navbar__logo'><Logo showHomePage={() => push('/')} isBlue={scrollTop < 70} /></div>}
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
          accountAddress ? (
            <div
              className='navbar__links__wallet'
              ref={profileRef}
              onClick={openProfile}
            >
              <span className='icon'><img src={WalletIcon} /></span>
              <span className='navbar__links__wallet__text'>{capitalize(convertNetworkName(networkType))} network</span>
              <div className={classNames('drop drop--profile', { 'drop--show': isProfileOpen })}>
                <ProfileDropDown handleLogOut={() => logout()} foreignNetwork={foreignNetwork === 'mainnet' ? 'main' : foreignNetwork} />
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
            <div className='navbar__links__wallet' onClick={() => web3connect.toggleModal()}>
              <span className='icon'><img src={WalletIcon} /></span>
              <span className='navbar__links__wallet__text'>Connect wallet</span>
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
  networkType: state.network.networkType
})

const mapDispatchToProps = {
  push
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NavBar))
