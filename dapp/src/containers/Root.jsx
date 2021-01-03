import React, { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Switch, Route } from 'react-router'
import has from 'lodash/has'
import { useStore } from 'store/mobx'

import CommunitiesPage from 'components/oven/CommunitiesPage'
import GoogleAnalyticsReporter from 'components/common/analytics'
import Wizard from 'components/wizard'
import Dashboard from 'components/dashboard'
import FuseDashboard from 'components/FuseDashboard'
import Price from 'components/price'
import HomePage from 'components/home'
import Footer from 'components/common/Footer'
import NavBar from 'components/common/NavBar'

import { loadModal } from 'actions/ui'
import { connectToWallet } from 'actions/network'
import ModalContainer from 'containers/ModalContainer'
import useWeb3Connect from 'hooks/useWeb3Connect'
import { getWeb3 } from 'services/web3'
import 'scss/main.scss'
import { WEB3_CONNECT_MODAL } from 'constants/uiConstants'

const Root = () => {
  const dispatch = useDispatch()
  const store = useStore()
  const isLoggedIn = useSelector(state => state.user.isLoggedIn)
  const onConnectCallback = (provider) => {
    store.network.initWeb3(provider)
    getWeb3({ provider })
    dispatch(connectToWallet())
  }

  const web3connect = useWeb3Connect(onConnectCallback)

  const handleDisconnect = useCallback(() => {
    web3connect?.core?.clearCachedProvider()
  }, [web3connect])

  const handleConnect = useCallback(() => {
    if (has(web3connect, 'core')) {
      dispatch(loadModal(WEB3_CONNECT_MODAL, { connectTo: web3connect.core.connectTo }))
    }
  }, [web3connect])

  useEffect(() => {
    if (web3connect.core.cachedProvider && isLoggedIn) {
      web3connect.core.connect()
    }
  }, [isLoggedIn])

  return (
    <div className='root__wrapper'>
      <NavBar handleConnect={handleConnect} handleDisconnect={handleDisconnect} />
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
