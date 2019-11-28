import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import { Switch, Route } from 'react-router'
import Oven from 'components/oven/Oven'
import Wizard from 'components/wizard'
import DashboardLayout from 'components/dashboard/containers/MainDashboard'
// import Web3 from 'containers/Web3'
import NavBar from 'components/common/NavBar'
import ScrollToTopController from 'containers/ScrollToTopController'
import Layout from 'components/common/Layout'
import HomePage from 'components/home/pages/HomePage'
import Footer from 'components/common/Footer'
import ErrorBoundary from 'components/common/ErrorBoundary'
import { Web3ProvideAuth } from 'hooks/useWeb3Auth'

const Root = ({ history }) => {
  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <ScrollToTopController>
          <ErrorBoundary>
            <Web3ProvideAuth>
              <Layout>
                {/* <Web3 isMobile={history.location.search.includes('isMobile')} /> */}
                <Switch>
                  <Route exact path='/' component={props => <HomePage {...props} />} />
                  <Route path='/view/issuance' component={props => <Wizard {...props} />} />
                  <Route path='/view/communities' component={props => <Oven {...props} />} />
                  <Route path='/view/community/:address' component={props => <DashboardLayout {...props} />} />
                </Switch>
                <Footer />
              </Layout>
            </Web3ProvideAuth>
          </ErrorBoundary>
        </ScrollToTopController>
      </ConnectedRouter>
    </Provider>
  )
}

export default Root
