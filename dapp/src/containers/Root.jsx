import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Switch, Route } from 'react-router'
import has from 'lodash/has'

import CommunitiesPage from 'components/oven/CommunitiesPage'
import Wizard from 'components/wizard'
import Dashboard from 'components/dashboard'
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
  const isLoggedIn = useSelector(state => state.user.isLoggedIn)
  const onConnectCallback = (provider) => {
    getWeb3({ provider })
    dispatch(connectToWallet())
  }

  const web3connect = useWeb3Connect(onConnectCallback)

  const handleDisconnect = React.useCallback(() => {
    web3connect.core.clearCachedProvider()
  }, [web3connect])

  const handleConnect = React.useCallback(() => {
    if (has(web3connect, 'core')) {
      dispatch(loadModal(WEB3_CONNECT_MODAL, { connectTo: web3connect.core.connectTo }))
    }
  }, [web3connect])

  useEffect(() => {
    if (web3connect.core.cachedProvider && isLoggedIn) {
      web3connect.core.connect()
    }
  }, [])

  return (
    <div className='root__wrapper'>
      <NavBar handleConnect={handleConnect} handleDisconnect={handleDisconnect} />
      <Switch>
        <Route exact path='/' render={props => <HomePage handleConnect={handleConnect} {...props} />} />
        <Route path='/view/issuance' render={props => <Wizard {...props} />} />
        <Route path='/view/communities' render={props => <CommunitiesPage {...props} />} />
        <Route path='/view/community/:address' render={props => <Dashboard {...props} />} />
      </Switch>
      <Footer />
      <ModalContainer />
    </div>
  )
}

export default Root
