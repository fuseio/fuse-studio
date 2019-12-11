import React, { useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import Web3connect from 'web3connect'
import { Switch, Route } from 'react-router'
import Oven from 'components/oven/Oven'
import Wizard from 'components/wizard'
import DashboardLayout from 'components/dashboard/containers'
import Layout from 'components/common/Layout'
import HomePage from 'components/home/pages/HomePage'
import Footer from 'components/common/Footer'

import { getInitialAddress } from 'actions/accounts'
import { connectToWallet } from 'actions/network'
import { useWeb3Auth } from 'hooks/useWeb3Auth'
import { getForeignNetwork } from 'selectors/network'
import { toLongName } from 'utils/network'
import { loadState } from 'utils/storage'

import useWeb3Connect from 'hooks/useWeb3Connect'
import useDefaultWallet from 'hooks/useDefaultWallet'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Portis from '@portis/web3'
// import Fortmatic from 'fortmatic'

const Root = ({
  connectToWallet,
  getInitialAddress,
  defaultNetwork
}) => {
  // useEffect(() => {
  //   getInitialAddress()
  // }, [])
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
      // fortmatic: {
      //   package: Fortmatic,
      //   options: {
      //     key: CONFIG.web3.fortmatic.id
      //   }
      // }
    }
  }

  const defaultWallet = useMemo(() => loadState('state.defaultWallet'), [])

  const checkInjected = useMemo(() => Web3connect.checkInjectedProviders(), [])

  useEffect(() => {
    async function autoLogin (defaultOne = '') {
      const provider = await useDefaultWallet(defaultOne, connectTo)
      connectToWallet(provider)
    }

    if (defaultWallet && connectTo) {
      autoLogin(defaultWallet)
    } else if (checkInjected.injectedAvailable) {
      autoLogin('metamask')
    }

    return () => { }
  }, [defaultWallet, defaultNetwork])

  const onConnectCallback = async (response) => {
    const { provider } = await web3Auth.signIn(response)
    connectToWallet(provider)
  }

  const logout = () => {
    web3Auth.signOut()
  }

  const web3connect = useWeb3Connect(webConnectOptions, onConnectCallback)

  return (
    <Layout>
      <Switch>
        <Route exact path='/' component={props => <HomePage logout={logout} web3connect={web3connect} {...props} />} />
        <Route path='/view/issuance' component={props => <Wizard logout={logout} web3connect={web3connect} {...props} />} />
        <Route path='/view/communities' component={props => <Oven logout={logout} web3connect={web3connect} {...props} />} />
        <Route path='/view/community/:address' component={props => <DashboardLayout logout={logout} web3connect={web3connect} {...props} />} />
      </Switch>
      <Footer />
    </Layout>
  )
}

const mapState = (state) => ({
  defaultNetwork: getForeignNetwork(state)
})

const mapDispatch = {
  connectToWallet,
  getInitialAddress
}

export default connect(mapState, mapDispatch)(Root)
