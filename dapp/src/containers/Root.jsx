import React, { useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import { Switch, Route } from 'react-router'

import CommunitiesPage from 'components/oven/CommunitiesPage'
import Wizard from 'components/wizard'
import Dashboard from 'components/dashboard'
import HomePage from 'components/home'
import Footer from 'components/common/Footer'
import NavBar from 'components/common/NavBar'

import { connectToWallet } from 'actions/network'
import ModalContainer from 'containers/ModalContainer'
import { useWeb3Auth } from 'hooks/useWeb3Auth'
import useWeb3Connect from 'hooks/useWeb3Connect'
import { loadState, saveState } from 'utils/storage'
import { getWeb3 } from 'services/web3'
import 'scss/main.scss'

const Root = ({
  connectToWallet
}) => {
  const web3Auth = useWeb3Auth()

  const latestProvider = useMemo(() => loadState('state.latestProvider'), [])

  const onConnectCallback = async (response) => {
    const { provider } = await web3Auth.signIn(response)
    getWeb3({ provider })
    connectToWallet()
  }

  const logout = () => {
    saveState('state.latestProvider', null)
    web3Auth.signOut()
  }

  const web3connect = useWeb3Connect({ latestProvider }, onConnectCallback)

  useEffect(() => {
    if (latestProvider) {
      web3connect.toggleModal()
    }
  }, [latestProvider])

  return (
    <div className='root__wrapper'>
      <NavBar logout={logout} web3connect={web3connect} />
      <Switch>
        <Route exact path='/' render={props => <HomePage logout={logout} web3connect={web3connect} {...props} />} />
        <Route path='/view/issuance/:templateId?' component={props => <Wizard logout={logout} web3connect={web3connect} {...props} />} />
        <Route path='/view/communities' component={props => <CommunitiesPage logout={logout} web3connect={web3connect} {...props} />} />
        <Route path='/view/community/:address' component={props => <Dashboard logout={logout} web3connect={web3connect} {...props} />} />
      </Switch>
      <Footer />
      <ModalContainer />
    </div>
  )
}

const mapDispatch = {
  connectToWallet
}

export default connect(null, mapDispatch)(Root)
