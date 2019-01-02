import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import { Route } from 'react-router'
import { ConnectedRouter } from 'connected-react-router'
import createHistory from 'history/createBrowserHistory'
import CLNFetcher from 'containers/CLNFetcher'
import Oven from 'components/oven/Oven'
import IssuanceWizard from 'components/issuance/IssuanceWizard'
import Dashboard from 'components/Dashboard'
import withTracker from 'containers/withTracker'
import Web3, {withNetwork} from 'containers/Web3'
import Layout from 'components/Layout'
import 'scss/styles.scss'

const history = createHistory()

const contactFormTransition = {
  atEnter: {
    offset: 100,
    opacity: 0
  },
  atLeave: {
    offset: 100,
    opacity: 0
  },
  atActive: {
    offset: 0,
    opacity: 1
  }
}

export default class Root extends Component {
  render () {
    const { store } = this.props
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <div>
            <Web3 />
            <div style={{height: '100%'}}>
              <Layout>
                <Route path='/' component={withNetwork(CLNFetcher)} />
                <Route exact path='/' component={withTracker(withNetwork(Oven))} />

                <Route
                  path='/view/issuance'
                  component={withTracker(withNetwork(IssuanceWizard))}
                  {...contactFormTransition}
                />
              </Layout>
              <Route
                path='/view/dashboard/:address'
                component={withTracker(withNetwork(Dashboard))}
                {...contactFormTransition}
              />
            </div>
          </div>
        </ConnectedRouter>
      </Provider>)
  }
}

Root.propTypes = {
  store: PropTypes.object.isRequired
}
