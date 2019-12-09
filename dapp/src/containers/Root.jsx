import React from 'react'
import { Switch, Route } from 'react-router'
import Oven from 'components/oven/Oven'
import Wizard from 'components/wizard'
import DashboardLayout from 'components/dashboard/containers'
import Web3 from 'containers/Web3'
import Layout from 'components/common/Layout'
import HomePage from 'components/home/pages/HomePage'
import Footer from 'components/common/Footer'

const Root = ({ history }) => {
  return (
    <Layout>
      <Web3 isMobile={history.location.search.includes('isMobile')} />
      <Switch>
        <Route exact path='/' component={props => <HomePage {...props} />} />
        <Route path='/view/issuance/:templateId?' component={props => <Wizard {...props} />} />
        <Route path='/view/communities' component={props => <Oven {...props} />} />
        <Route path='/view/community/:address' component={props => <DashboardLayout {...props} />} />
      </Switch>
      <Footer />
    </Layout>
  )
}

export default Root
