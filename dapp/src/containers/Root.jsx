import React, { useEffect, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Switch, Route } from 'react-router'
import { useStore } from 'store/mobx'
import ReactModal from 'react-modal'
import { useModal } from 'react-modal-hook'

import useWeb3Connect from 'hooks/useWeb3Connect'
import ModalContainer from 'containers/ModalContainer'

import CommunitiesPage from 'components/oven/CommunitiesPage'
import GoogleAnalyticsReporter from 'components/common/analytics'
import Wizard from 'components/wizard'
import Dashboard from 'components/dashboard'
import FuseDashboard from 'components/FuseDashboard'
import Price from 'components/price'
import HomePage from 'components/home'
import Footer from 'components/common/Footer'
import NavBar from 'components/common/NavBar'

import TorusIcon from 'images/torus_icon.jpeg'
import EtherIcon from 'images/ether.svg'
import MetamaskIcon from 'images/metamask-fox.png'
import FuseLoader from 'images/loader-fuse.gif'
import DepBar from 'images/deprecation-banner.svg'

import { connectToWallet } from 'actions/network'
import { getWeb3 } from 'services/web3'
import 'scss/main'

function Root () {
  const dispatch = useDispatch()
  const [modalStatus, setModalStatus] = useState(false)
  const [isConnect, setConnectModalStatus] = useState(false)
  const store = useStore()
  const isLoggedIn = useSelector(state => state.user.isLoggedIn)
  const connectingToWallet = useSelector(state => state.network.connectingToWallet)
  const onConnectCallback = (provider) => {
    store.network.initWeb3(provider)
    getWeb3({ provider })
    dispatch(connectToWallet())
  }

  const web3connect = useWeb3Connect(onConnectCallback)

  useEffect(() => {
    if (!connectingToWallet) {
      setConnectModalStatus(false)
    }
  }, [connectingToWallet])

  const handleDisconnect = useCallback(() => {
    web3connect?.core?.clearCachedProvider()
  }, [web3connect])

  const createHandleProvider = (provider) => (e) => {
    web3connect.core.connectTo(provider)
    setModalStatus(false)
    showConnectModal()
    setConnectModalStatus(true)
  }

  const [showConnectWalletModal] = useModal(() => (
    <ReactModal isOpen={modalStatus} overlayClassName='use_modal__overlay' className='use_modal__content'>
      <div className='wallet-modal'>
        <div className='wallet-modal__title'>Connect your wallet</div>
        <div className='wallet-modal__providers-list'>
          <div className='wallet-modal__provider' onClick={createHandleProvider('torus')}>
            <img className='image' src={TorusIcon} />
            <div className='text'>
              Torus
            </div>
            <div className='info'>Connect using Torus</div>
          </div>
          <div className='wallet-modal__provider' onClick={createHandleProvider('injected')}>
            <img className='image' src={MetamaskIcon} />
            <div className='text'>
              MetaMask
            </div>
            <div className='info'>Connect using metamask</div>
          </div>
        </div>
        <div className='wallet-modal__explanation grid-x grid-margin-x align-middle align-center'>
          <div className='cell shrink'>
            <img src={EtherIcon} />
          </div>
          <div className='cell small-20'>
            <div>A wallet is needed in order to interact with both Ethereum and Fuse.</div>
          </div>
        </div>
      </div>
    </ReactModal>
  ), [modalStatus, web3connect])

  const [showConnectModal] = useModal(() => (
    <ReactModal isOpen={isConnect} overlayClassName='use_modal__overlay' className='use_modal__content'>
      <div className='status status__issue status--radius-all status--dark'>
        <div style={{ maxWidth: '280px' }} className='status__title status__title--white'>
          Connecting
          <span className='status__loader'>
            <span>.</span><span>.</span><span>.</span>
          </span>
        </div>
        <div className='status__sub-title status__sub-title--white'>
          <div className='status__loader__img'>
            <img src={FuseLoader} alt='Fuse loader' />
          </div>
        </div>
      </div>
    </ReactModal>
  ), [isConnect])

  const handleConnect = () => {
    setModalStatus(true)
    showConnectWalletModal()
  }

  useEffect(() => {
    if (web3connect.core.cachedProvider && isLoggedIn) {
      web3connect.core.connect()
      showConnectModal()
      setConnectModalStatus(true)
    }
  }, [isLoggedIn])

  return (
    <div className='root__wrapper'>
      <NavBar handleConnect={handleConnect} handleDisconnect={handleDisconnect} />

      <div className='dep-bar'><img className='dep-bar__img' src={DepBar} />
        <div className='dep-bar__text'>
          The Studio will soon be replaced by a new Fuse blockchain API platform - Charge!
          Look out for the launch and early access coming soon.
        </div>
      </div>
 
      <Route component={GoogleAnalyticsReporter} />
      <Switch>
        <Route exact path='/'>
          <HomePage handleConnect={handleConnect} />
        </Route>
        <Route path='/view/issuance'>
          <Wizard />
        </Route>
        <Route path='/view/communities'>
          <CommunitiesPage />
        </Route>
        <Route path='/view/community/:address'>
          <Dashboard />
        </Route>
        <Route path='/view/price'>
          <Price />
        </Route>
        <Route path='/view/fuse-community/:address'>
          <FuseDashboard />
        </Route>
      </Switch>
      <Footer />
      <ModalContainer />
    </div>
  )
}

export default Root
