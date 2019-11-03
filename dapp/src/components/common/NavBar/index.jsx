import React, { useEffect, useRef, useState, useCallback } from 'react'
import { connect } from 'react-redux'
import Logo from 'components/common/Logo'
import HelpIcon from 'images/help.svg'
import NotificationIcon from 'images/notification.svg'
import WalletIcon from 'images/fuse-wallet.svg'
import classNames from 'classnames'
import ProfileDropDown from './../ProfileDropDown'
import { isMobileOnly } from 'react-device-detect'
import { withRouter } from 'react-router-dom'
import { withNetwork } from 'containers/Web3'
import capitalize from 'lodash/capitalize'
import { convertNetworkName } from 'utils/network'
import { getNetworkType } from 'actions/network'
import { loadModal } from 'actions/ui'
import { CHOOSE_PROVIDER } from 'constants/uiConstants'

const NavBar = ({
  history,
  accountAddress,
  networkType,
  getNetworkType,
  foreignNetwork,
  loadModal,
  withLogo = true
}) => {
  const [isHelpOpen, setHelpOpen] = useState(false)
  const [isProfileOpen, setProfileOpen] = useState(false)
  const [scrollTop, setScrollTop] = useState(false)
  const helpRef = useRef(null)
  const profileRef = useRef(null)

  const handleScroll = useCallback(event => {
    let lastScrollY = window.scrollY
    setScrollTop(lastScrollY)
  }, [])

  const handleClickOutside = useCallback(event => {
    if (helpRef && helpRef.current && !helpRef.current.contains(event.target)) {
      setHelpOpen(false)
    }

    if (profileRef && profileRef.current && !profileRef.current.contains(event.target)) {
      setProfileOpen(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('scroll', handleScroll)
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('scroll', handleScroll)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [handleScroll, handleClickOutside])

  const goToHome = () => history.push('/')

  const chooseProvider = () => {
    if (!accountAddress) {
      if (window && window.analytics) {
        window.analytics.track('Connect wallet clicked - not connected')
      }
      loadModal(CHOOSE_PROVIDER)
    }
  }

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
      { (withLogo || (isMobileOnly && scrollTop > 70)) && <div className='navbar__logo'><Logo onClick={goToHome} isBlue={scrollTop < 70} /></div> }
      <div className='navbar__links' style={{ marginLeft: !withLogo ? 'auto' : null }}>
        <div
          className='navbar__links__help'
          ref={helpRef}
          onClick={openHelp}
        >
          <span className='icon'><img src={HelpIcon} /></span>
          <div style={{ minWidth: '130px' }} className={classNames('drop', { 'drop--show': isHelpOpen })}>
            <ul className='drop__options'>
              <li className='drop__options__item'><a href='https://docs.fusenet.io/the-fuse-studio/faq' target='_blank' rel='noopener noreferrer'>FAQ</a></li>
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
                <ProfileDropDown foreignNetwork={foreignNetwork} />
              </div>
            </div>
          ) : (
            <div className='navbar__links__wallet' onClick={chooseProvider}>
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
  accountAddress: state.network.accountAddress
})

const mapDispatchToProps = {
  getNetworkType,
  loadModal
}

export default withRouter(withNetwork((connect(mapStateToProps, mapDispatchToProps)(NavBar))))
