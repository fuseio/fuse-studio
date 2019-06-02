import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import { Route, Switch } from 'react-router'
import { ConnectedRouter } from 'connected-react-router'
// import CLNFetcher from 'containers/CLNFetcher'
import Oven from 'components/oven/Oven'
import IssuanceWizard from 'components/issuance/IssuanceWizard'
import Dashboard from 'components/dashboard/Dashboard'
import MainDashboard from 'components/dashboard/pages/Dashboard'
import EntityProfile from 'components/dashboard/EntityProfile'
import withTracker from 'containers/withTracker'
import Web3, { withNetwork } from 'containers/Web3'
import Layout from 'components/Layout'

const routes = [
  {
    path: '/',
    exact: true,
    component: withTracker(withNetwork(Oven))
  },
  {
    path: '/view/issuance',
    component: withTracker(withNetwork(IssuanceWizard))
  },
  {
    path: '/view/dashboard/:networkType/:address',
    component: withTracker(withNetwork(Dashboard)),
    routes: [
      {
        path: '/view/dashboard/:networkType/:address/merchants',
        component: () => <div>dfdf</div>
      },
      {
        path: '/view/dashboard/:networkType/:address/users',
        component: () => <div>users</div>
      }
    ]
  },
  {
    path: '/view/directory/:communityAddress/:account',
    exact: true,
    component: withTracker(withNetwork(EntityProfile))
  },
  {
    path: '/DevPage',
    component: withTracker(withNetwork(MainDashboard))
  }
]

function RouteWithSubRoutes (route) {
  return (
    <Layout>
      <Route
        path={route.path}
        render={props => (
          <route.component {...props} routes={route.routes} />
        )}
      />
    </Layout>
  )
}

export default class Root extends Component {
  render () {
    const { store, history } = this.props
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <Fragment>
            <Web3 />
            <Switch>
              {routes.map((route, i) => (
                <RouteWithSubRoutes key={i} {...route} />
              ))}
            </Switch>
          </Fragment>
        </ConnectedRouter>
      </Provider>)
  }
}

Root.propTypes = {
  store: PropTypes.object.isRequired
}
