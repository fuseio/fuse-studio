import React, { useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import Web3connect from 'web3connect'
import { Switch, Route } from 'react-router'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Portis from '@portis/web3'
// import Torus from '@toruslabs/torus-embed'
// import Fortmatic from 'fortmatic'

import Oven from 'components/oven/Oven'
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
import { getAccountAddress } from 'selectors/accounts'
import { getForeignNetwork } from 'selectors/network'
import { toLongName } from 'utils/network'
import { loadState, saveState } from 'utils/storage'

import 'scss/main.scss'

const Root = ({
  connectToWallet,
  defaultNetwork,
  location
}) => {
  const networkState = React.useMemo(() => loadState('state.network'), [])
  const networkToConnectTo = (networkState && networkState.networkType && toLongName(networkState.networkType)) || toLongName(defaultNetwork)

  const connectTo = networkToConnectTo === 'fuse' ? {
    nodeUrl: CONFIG.web3.fuseProvider,
    chainId: 122
  } : networkToConnectTo
  const web3Auth = useWeb3Auth()
  const webConnectOptions = {
    network: connectTo,
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
      }
      // TODO - add more providers
      // torus: {
      //   package: Torus, // required
      //   options: {
      //     enableLogging: CONFIG.env !== 'production',
      //     buttonPosition: 'top-right',
      //     buildEnv: CONFIG.env === 'production' ? 'production' : 'development'
      //   }
      // }
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
        const provider = await useDefaultWallet(defaultOne, connectTo)
        connectToWallet(provider)
      } catch (error) {
        // console.log({ error })
      }
    }

    if (defaultWallet && connectTo) {
      autoLogin(defaultWallet)
    } else if (checkInjected.injectedAvailable && reconnect) {
      autoLogin('metamask')
    }

    return () => { }
  }, [defaultWallet, defaultNetwork])

  const onConnectCallback = async (response) => {
    const { provider } = await web3Auth.signIn(response)
    connectToWallet(provider)
  }

  const isInCommunityPage = location.pathname.includes('/community/')

  const isInIssuancePage = location.pathname.includes('/issuance')

  const logout = () => {
    saveState('state.reconnect', false)
    web3Auth.signOut()
  }

  const web3connect = useWeb3Connect(webConnectOptions, onConnectCallback)

  return (
    <div className='root__wrapper'>
      {!isInIssuancePage && <NavBar modifier={isInCommunityPage} logout={logout} withLogo={!isInCommunityPage} web3connect={web3connect} />}
      <Switch>
        <Route exact path='/' render={props => <HomePage logout={logout} web3connect={web3connect} {...props} />} />
        <Route path='/view/issuance/:templateId?' component={props => <Wizard logout={logout} web3connect={web3connect} {...props} />} />
        <Route path='/view/communities' component={props => <Oven logout={logout} web3connect={web3connect} {...props} />} />
        <Route path='/view/community/:address' component={props => <Dashboard logout={logout} web3connect={web3connect} {...props} />} />
      </Switch>
      <Footer />
      <ModalContainer />
    </div>
  )
}

const mapState = (state) => ({
  defaultNetwork: getForeignNetwork(state),
  accountAddress: getAccountAddress(state),
  ...state.router
})

const mapDispatch = {
  connectToWallet
}

export default connect(mapState, mapDispatch)(Root)
