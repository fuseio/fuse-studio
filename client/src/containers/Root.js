import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import { Route } from 'react-router'
import { ConnectedRouter } from 'connected-react-router'
import CLNFetcher from 'containers/CLNFetcher'
import Oven from 'components/oven/Oven'
import IssuanceWizard from 'components/issuance/IssuanceWizard'
import Dashboard from 'components/dashboard/Dashboard'
import EntityProfile from 'components/dashboard/EntityProfile'
import withTracker from 'containers/withTracker'
import Web3, { withNetwork } from 'containers/Web3'
import Layout from 'components/Layout'

export default class Root extends Component {
  render () {
    const { store, history } = this.props
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <React.Fragment>
            <Web3 />
            <Layout>
              <Route path='/' component={withNetwork(CLNFetcher)} />
              <Route exact path='/' component={withTracker(withNetwork(Oven))} />
              <Route
                path='/view/issuance'
                component={withTracker(withNetwork(IssuanceWizard))}
              />
              <Route
                path='/view/dashboard/:networkType/:address'
                component={withTracker(withNetwork(Dashboard))}
              />
              <Route
                exact
                path='/view/directory/:listAddress/:hash'
                component={withTracker(withNetwork(EntityProfile))}
              />
            </Layout>
          </React.Fragment>
        </ConnectedRouter>
      </Provider>)
  }
}

Root.propTypes = {
  store: PropTypes.object.isRequired
}
