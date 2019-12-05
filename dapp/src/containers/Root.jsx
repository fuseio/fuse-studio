import React from 'react'
// import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Switch, Route } from 'react-router'
import Oven from 'components/oven/Oven'
import Wizard from 'components/wizard'
import DashboardLayout from 'components/dashboard/containers'
// import Web3 from 'containers/Web3'
import NavBar from 'components/common/NavBar'
import Layout from 'components/common/Layout'
import HomePage from 'components/home/pages/HomePage'
import Footer from 'components/common/Footer'

import { connectToWallet } from 'actions/network'
import { useWeb3Auth } from 'hooks/useWeb3Auth'
// import useOutsideClick from 'hooks/useOutsideClick'

import Web3connect from 'web3connect'
import useWeb3Connect from 'hooks/useWeb3Connect'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Portis from '@portis/web3'
import Fortmatic from 'fortmatic'
// import { ConnectedRouter } from 'connected-react-router'
// import ScrollToTopController from 'containers/ScrollToTopController'
// import { Web3ProvideAuth } from 'hooks/useWeb3Auth'
// import ErrorBoundary from 'components/common/ErrorBoundary'

const Root = ({
  connectToWallet
}) => {
  const web3Auth = useWeb3Auth()
  const webConnectOptions = {
    // network: 'ropsten',
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider, // required
        options: {
          infuraId: CONFIG.web3.apiKey // required
        }
      },
      portis: {
        package: Portis, // required
        options: {
          id: CONFIG.web3.portis.id // required
        }
      },
      fortmatic: {
        package: Fortmatic, // required
        options: {
          key: CONFIG.web3.fortmatic.id // required
        }
      }
    }
  }

  const onConnectCallback = async (response) => {
    const { provider } = await web3Auth.signIn(response)
    console.log({ tempst: Web3connect.getProviderInfo(provider) })
    connectToWallet(provider)
  }

  const web3connect = useWeb3Connect(webConnectOptions, onConnectCallback)
  return (
    <Layout>
      <NavBar handleConnectWallet={() => web3connect.toggleModal()} />
      {/* <Web3 isMobile={history.location.search.includes('isMobile')} /> */}
      <Switch>
        <Route exact path='/' component={props => <HomePage {...props} />} />
        <Route path='/view/issuance' component={props => <Wizard {...props} />} />
        <Route path='/view/communities' component={props => <Oven {...props} />} />
        <Route path='/view/community/:address' component={props => <DashboardLayout {...props} />} />
      </Switch>
      <Footer />
    </Layout>
  )
}

export default connect(null, {
  connectToWallet
})(Root)
