import React from 'react'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import Oven from 'components/oven/Oven'
// import IssuanceWizard from 'components/issuance/IssuanceWizard'
import Wizard from 'components/wizard'
import DashboardLayout from 'components/dashboard/containers/MainDashboard'
import JoinProvider from 'containers/JoinProvider'
import SignInProvider from 'containers/SignInProvider'
import Web3, { withNetwork } from 'containers/Web3'
import withTracker from 'containers/withTracker'
import ScrollToTopController from 'containers/ScrollToTopController'
import Layout from 'components/common/Layout'
import HomePage from 'components/home/pages/HomePage'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import Footer from 'components/common/Footer'

const Root = ({ store, history }) => {
  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <BrowserRouter>
          <ScrollToTopController>
            <Layout>
              <Web3 isMobile={history.location.search.includes('isMobile')} />
              <Switch>
                <Route exact path='/' component={HomePage} />
                {/* <Route path='/view/issuance' component={withTracker(withNetwork(IssuanceWizard))} /> */}
                <Route path='/view/issuance' component={withTracker(withNetwork(Wizard))} />
                <Route path='/view/communities' component={withTracker(withNetwork(Oven))} />
                <Route path='/view/community/:address' component={withTracker(withNetwork(DashboardLayout))} />
                <Route path='/view/sign/:isMobileApp?' component={withTracker(withNetwork(SignInProvider))} />
                <Route path='/view/join/:address' component={withTracker(withNetwork(JoinProvider))} />
              </Switch>
              <Footer />
            </Layout>
          </ScrollToTopController>
        </BrowserRouter>
      </ConnectedRouter>
    </Provider>
  )
}

Root.propTypes = {
  store: PropTypes.object.isRequired
}

export default Root
