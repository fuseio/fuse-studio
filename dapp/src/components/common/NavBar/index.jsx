import React, { useRef, useState } from 'react'
import { connect, useDispatch } from 'react-redux'
import ReactModal from 'react-modal'
import { useModal } from 'react-modal-hook'
import Logo from 'components/common/Logo'
import HelpIcon, { ReactComponent as Help } from 'images/help.svg'

import CloseButton from 'images/x.png'
import GoogleIcon from 'images/google.svg'
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
  handleLogout,
  isLoggedIn
}) => {
  const dispatch = useDispatch()
  const isInCommunityPage = location.pathname.includes('/community/')
  const isInNestedCommunityPage = isInCommunityPage && !location.pathname.includes('justCreated') && location.pathname.split('/').length > 4
  const isInIssuancePage = location.pathname.includes('/issuance')

  if (isInIssuancePage) {
    return null
  }

  const modifier = isInCommunityPage
  const withLogo = !isInCommunityPage

  const { y: scrollY } = useWindowScroll()
  const [isHelpOpen, setHelpOpen] = useState(false)
  const [isProfileOpen, setProfileOpen] = useState(false)
  // const [modalStatus, setModalStatus] = useState(false)
  const helpRef = useRef(null)
  // const loginRef = useRef(null)
  const profileRef = useRef(null)

  // const [showModal] = useModal(() => (
  //   <ReactModal ref={loginRef} isOpen={modalStatus} overlayClassName='use_modal__overlay' className='use_modal__content'>
  //     <div className='use_modal__content__close' onClick={() => setModalStatus(false)}>
  //       <img src={CloseButton} />
  //     </div>
  //     <div className='login-modal__title'>Please choose one of the following</div>
  //     <div className='grid-x align-middle align-justify grid-margin-x'>
  //       <button className='login-modal__button cell small-24 medium-12'>
  //         <img src={GoogleIcon} />
  //         <div>Create new</div>
  //       </button>
  //       <button className='login-modal__button cell small-24 medium-12'>
  //         <img src={GoogleIcon} />
  //         <div>Use existing</div>
  //       </button>
  //     </div>
  //   </ReactModal>
  // ), [modalStatus])

  // useOutsideClick(loginRef, () => {
  //   if (modalStatus) {
  //     setModalStatus(false)
  //   }
  // })

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

  const isGreaterThen70 = () => scrollY > 70

  return (
    <div className={classNames('navbar',
      {
        'navbar--scroll': isGreaterThen70(),
        'navbar--short': modifier && !isMobile,
        'navbar--fixed': isInNestedCommunityPage,
        'navbar--bgImage': !isInNestedCommunityPage
      })}>
      {(withLogo || (isMobile && isGreaterThen70())) && <div className='navbar__logo'>
        <Logo showHomePage={() => dispatch(push('/'))} isBlue={false} />
      </div>}
      <div className='navbar__links' style={{ marginLeft: !withLogo ? 'auto' : null }}>
        <div
          className='navbar__links__help'
          ref={helpRef}
          onClick={openHelp}
        >
          <span className='icon'>{isInCommunityPage ? <Help className='help' /> : <img src={HelpIcon} />}</span>
          <div style={{ minWidth: '130px' }} className={classNames('drop', { 'drop--show': isHelpOpen })}>
            <ul className='drop__options'>
              <li className='drop__options__item'><a href='https://fuse.io' target='_blank' rel='noopener noreferrer'>Website</a></li>
              <li className='drop__options__item'><a href='https://docs.fuse.io/the-fuse-studio/faq' target='_blank' rel='noopener noreferrer'>FAQ</a></li>
              <li className='drop__options__item'><a href='https://github.com/fuseio' target='_blank'>Github</a></li>
              <li className='drop__options__item'><a href='mailto:hello@fuse.io'>Contact us</a></li>
            </ul>
          </div>
        </div>
        {
          connectingToWallet ? (
            <div className='navbar__links__wallet navbar__connecting'>
              <span className='navbar__links__wallet__text'>Connecting to wallet</span>
              <span className='animate'>.</span>
              <span className='animate'>.</span>
              <span className='animate'>.</span>
            </div>
          ) : !isLoggedIn ? (
            <div className='navbar__links__wallet navbar__links__wallet--pointer' onClick={handleLogin}>
              <span className='icon'><img src={LoginIcon} /></span>
              <span className='navbar__links__wallet__text'>Login</span>
            </div>
          ) : isLoggedIn && !accountAddress ? (
            <div className='navbar__links__wallet navbar__links__wallet--pointer' onClick={handleConnect}>
              <span className='icon'><img src={WalletIcon} /></span>
              <span className='navbar__links__wallet__text'>Connect wallet</span>
            </div>
          ) : (
            <div
              className='navbar__links__wallet navbar__links__wallet--pointer'
              ref={profileRef}
              onClick={openProfile}
            >
              <span className='icon'><img src={isInCommunityPage ? NewWalletIcon : WalletIcon} /></span>
              <span className='navbar__links__wallet__text'>{capitalize(convertNetworkName(networkType))} network</span>
              <div className={classNames('drop drop--profile', { 'drop--show': isProfileOpen })}>
                <ProfileDropDown handleLogOut={handleLogout} foreignNetwork={(foreignToken && foreignToken.networkType) === 'mainnet' ? 'main' : (foreignToken && foreignToken.networkType)} />
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

export default withRouter(connect(mapStateToProps, null)(NavBar))
