import React, { useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import Web3connect from 'web3connect'
import { Switch, Route } from 'react-router'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Portis from '@portis/web3'
import Torus from '@toruslabs/torus-embed'
// import Fortmatic from 'fortmatic'

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
import useDefaultWallet from 'hooks/useDefaultWallet'
import { loadState, saveState } from 'utils/storage'
import { getWeb3 } from 'services/web3'
import 'scss/main.scss'

const Root = ({
  connectToWallet
}) => {
  const web3Auth = useWeb3Auth()
  const webConnectOptions = {
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: CONFIG.web3.apiKey
        }
      },
      portis: {
        package: Portis,
        options: {
          id: CONFIG.web3.portis.id
        }
      },
      torus: {
        package: Torus, // required
        options: {
          enableLogging: CONFIG.env !== 'production',
          buttonPosition: 'top-right',
          buildEnv: CONFIG.env === 'production' ? 'production' : 'development'
        }
      }
      // fortmatic: {
      //   package: Fortmatic,
      //   options: {
      //     key: CONFIG.web3.fortmatic.id
      //   }
      // }
    }
  }

  const defaultWallet = useMemo(() => loadState('state.defaultWallet'), [])
  const reconnect = useMemo(() => loadState('state.reconnect'), [])

  const checkInjected = useMemo(() => Web3connect.checkInjectedProviders(), [])

  useEffect(() => {
    async function autoLogin (defaultOne = '') {
      try {
        const provider = await useDefaultWallet(defaultOne)
        getWeb3({ provider })
        connectToWallet()
      } catch (error) {
        console.log({ error })
      }
    }
    debugger
    if (defaultWallet) {
      autoLogin(defaultWallet)
    } else if (checkInjected.injectedAvailable && reconnect) {
      autoLogin('metamask')
    }

    return () => { }
  }, [])

  const onConnectCallback = async (response) => {
    const { provider } = await web3Auth.signIn(response)
    getWeb3({ provider })
    connectToWallet()
  }

  const logout = () => {
    saveState('state.reconnect', false)
    web3Auth.signOut()
  }

  const web3connect = useWeb3Connect(webConnectOptions, onConnectCallback)

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
