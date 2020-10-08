import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Switch, Route } from 'react-router'

import CommunitiesPage from 'components/oven/CommunitiesPage'
import Wizard from 'components/wizard'
import Dashboard from 'components/dashboard'
import HomePage from 'components/home'
import Footer from 'components/common/Footer'
import NavBar from 'components/common/NavBar'

import { connectToWallet } from 'actions/network'
import ModalContainer from 'containers/ModalContainer'
import useWeb3Connect from 'hooks/useWeb3Connect'
import { getWeb3 } from 'services/web3'
import 'scss/main.scss'

const Root = () => {
  const dispatch = useDispatch()
  const onConnectCallback = (provider) => {
    getWeb3({ provider })
    dispatch(connectToWallet())
  }

  const web3connect = useWeb3Connect(onConnectCallback)

  useEffect(() => {
    if (web3connect.core.cachedProvider) {
      web3connect.core.connect()
    }
  }, [])

  return (
    <div className='root__wrapper'>
      <NavBar web3connect={web3connect} />
      <Switch>
        <Route exact path='/' render={props => <HomePage {...props} />} />
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
